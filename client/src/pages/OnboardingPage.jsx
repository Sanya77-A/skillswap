import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { updateProfile } from "../features/user/userSlice";
import { api } from "../utils/api";

export default function OnboardingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [skillsOffered, setSkillsOffered] = useState("");
  const [skillsWanted, setSkillsWanted] = useState("");
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);

  const availabilityOpts = ["weekdays", "weekends", "flexible", "anytime"];

  const handleNext = async () => {
    setLoading(true);
    const offered = skillsOffered.split(",").map((s) => s.trim()).filter(Boolean);
    const wanted = skillsWanted.split(",").map((s) => s.trim()).filter(Boolean);
    try {
      await api.put("/users/me", {
        skillsOffered: offered,
        skillsWanted: wanted,
        availability: availability.length ? availability : ["flexible"],
      });
      dispatch(updateProfile.fulfilled({}));
      toast.success("Profile updated");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-6">Complete your profile</h1>
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Skills I offer (comma-separated)</label>
            <input
              type="text"
              value={skillsOffered}
              onChange={(e) => setSkillsOffered(e.target.value)}
              placeholder="e.g. React, Node.js"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Skills I want (comma-separated)</label>
            <input
              type="text"
              value={skillsWanted}
              onChange={(e) => setSkillsWanted(e.target.value)}
              placeholder="e.g. DSA, Python"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Availability</label>
            <div className="flex flex-wrap gap-2">
              {availabilityOpts.map((opt) => (
                <label key={opt} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={availability.includes(opt)}
                    onChange={(e) => setAvailability((a) => (e.target.checked ? [...a, opt] : a.filter((x) => x !== opt)))}
                  />
                  <span className="capitalize">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <button onClick={handleNext} disabled={loading} className="w-full py-2 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50">
            {loading ? "Saving..." : "Save & go to Dashboard"}
          </button>
        </div>
      )}
    </div>
  );
}
