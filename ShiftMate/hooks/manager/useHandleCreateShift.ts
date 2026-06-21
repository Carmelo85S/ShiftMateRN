import { supabase } from "@/lib/supabase";
import { createShift } from "@/queries/managerQueries";
import { FormShiftSchema } from "@/src/validation/formShift.schema";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export const useHandleCreateShift = () => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser()
      .then(({ data }) => {
        if (!mounted) return;
        setCurrentUser(data?.user ?? null);
      })
      .catch((e) => {
        console.error("Failed to get current user:", e);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const formatTime = (date: Date): string => {
    return `${String(date.getHours()).padStart(2, "0")}:${String(
      date.getMinutes()
    ).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const handleCreate = async (form: any) => {
    const result = FormShiftSchema.safeParse(form);

    if (!result.success) {
      Alert.alert("Validation Error", result.error.issues[0].message);
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not found");

      // 1. Get profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("business_id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile?.business_id) {
        throw new Error("No business linked.");
      }

      // 2. Get business
      const { data: business, error: bizError } = await supabase
        .from("businesses")
        .select("id, owner_id, business_type, plan_type")
        .eq("id", profile.business_id)
        .single();

      if (bizError || !business) {
        throw new Error("Business data not found.");
      }

      // 3. FIX CRITICO: department_id mapping sicuro
      const isStaffing = business.business_type === "staffing";

      const safeDepartmentId =
        typeof result.data.department_id === "string" &&
        result.data.department_id.match(/^[0-9a-fA-F-]{36}$/)
          ? result.data.department_id
          : null;

      // 4. Payload coerente DB
      const payload = {
        title: result.data.title,
        description: result.data.description || "",

        departmentId: isStaffing ? null : safeDepartmentId,

        date: formatDate(result.data.shift_date),
        startTime: formatTime(result.data.start_time),
        endTime: formatTime(result.data.end_time),

        hourly_rate: result.data.hourly_rate,

        required_workers: result.data.required_workers || 1,

        address: result.data.address || null,
        city: result.data.city || null,
        client_name: result.data.client_name || null,
      };


      // 6. Role check
      //const role = await getBusinessRole(user.id, business.id);
      const isOwner = business.owner_id === user.id;
      //console.log("ROLE: ", role)
      console.log("isOwner: ", isOwner)

      // 1. verifica crediti

      console.log("BEFORE RPC", {
        userId: user.id,
        businessId: business.id,
        isOwner,
        planType: business.plan_type,
      });

            
      const { data: success, error } = await supabase.rpc(
        "consume_job_credit",
        {
          p_business_id: business.id
        }
      );

      console.log("AFTER RPC", {
        success,
        error,
      });

      if (error) {
        throw error;
      }

      if (!success) {
        Alert.alert(
          "No credits remaining",
          "You have used all available job posting credits. Renew your plan to continue posting shifts.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Renew Plan",
              onPress: () =>
                router.push({
                  pathname: "/subscription",
                  params: {
                    businessId: business.id,
                    userRole: isOwner ? "owner" : "manager",
                  },
                }),
            },
          ]
        );

        return;
      }

      // SHIFT CREATION
      await createShift(user.id, imageUrl, payload);
      console.log("Create Shift: ", payload)

      // 3. redirect
      router.push("/(manager)/(tabs)/shift");
          } catch (err: any) {
            console.error("DEBUG - Errore finale:", err);
            Alert.alert("Error", err.message);
          } finally {
            setLoading(false);
          }
        };

  return { handleCreate, loading, imageUrl, setImageUrl };
};