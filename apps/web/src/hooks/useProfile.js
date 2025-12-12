import { useState, useEffect } from "react";

export function useProfile(user) {
  const [profile, setProfile] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.profile);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    } else if (user === null) {
      // User fetch completed but no user found
      setInitialLoading(false);
    }
  }, [user]);

  return { profile, initialLoading };
}
