import { Card } from "@/components/ui/card";
import { UserProfile } from "@/components/UserProfile";

const UserProfilePage = () => {
  return (
    <Card className="p-6 min-h-[80vh] flex justify-center">
      <UserProfile />
    </Card>
  );
};

export default UserProfilePage;
