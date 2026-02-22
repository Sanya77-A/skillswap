import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchMe } from "../features/auth/authSlice";
import { api } from "../utils/api";
import { Card, CardContent } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        experienceLevel: user.experienceLevel || "intermediate",
        skillsOffered: (user.skillsOffered || []).join(", "),
        skillsWanted: (user.skillsWanted || []).join(", "),
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("bio", data.bio);
    formData.append("location", data.location);
    formData.append("experienceLevel", data.experienceLevel);
    formData.append("skillsOffered", JSON.stringify(data.skillsOffered.split(",").map((s) => s.trim()).filter(Boolean)));
    formData.append("skillsWanted", JSON.stringify(data.skillsWanted.split(",").map((s) => s.trim()).filter(Boolean)));
    if (data.profileImage?.[0]) formData.append("profileImage", data.profileImage[0]);
    try {
      await api.put("/users/me", formData, { headers: { "Content-Type": "multipart/form-data" } });
      dispatch(fetchMe()); // refresh auth user
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  if (!user) return <p className="text-text-secondary">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary mb-2">Profile</h1>
      <p className="text-text-secondary text-sm mb-6">Edit your profile and skills.</p>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Avatar src={user.profileImage?.startsWith("http") ? user.profileImage : user.profileImage ? `/api${user.profileImage}` : undefined} name={user.name} size="lg" />
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Profile photo</label>
              <input type="file" accept="image/*" {...register("profileImage")} className="w-full text-sm text-text-secondary file:mr-2 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-surface-2 file:text-text-primary" />
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Name" error={errors.name && "Required"} {...register("name", { required: true })} />
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Bio</label>
              <textarea {...register("bio")} rows={3} className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-secondary focus:ring-2 focus:ring-accent" />
            </div>
            <Input label="Location" {...register("location")} />
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Experience level</label>
              <select {...register("experienceLevel")} className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-text-primary focus:ring-2 focus:ring-accent">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <Input label="Skills I offer (comma-separated)" {...register("skillsOffered")} />
            <Input label="Skills I want (comma-separated)" {...register("skillsWanted")} />
            <Button type="submit">Save profile</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
