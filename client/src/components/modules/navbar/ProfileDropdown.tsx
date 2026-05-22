"use client";

import { Dropdown } from "../../ui/Dropdown";
import { Button } from "../../ui/Button";
import { LogOut, Store, User } from "lucide-react";
import { useContext, useState } from "react";
import AuthContext from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

type ProfileDropdownProps = {
  openState: boolean;
  onClose: () => void;
};

export const ProfileDropdown = ({
  openState,
  onClose,
}: ProfileDropdownProps) => {
  const router = useRouter();
  const { logoutUser } = useContext(AuthContext)!;
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logoutUser();
    setLoading(false);
  };

  const handleOptionClick = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <Dropdown
      openState={openState}
      onClose={onClose}
      className="right-3 mt-2 w-60! border-gray-200! shadow-md z-50!"
    >
      <div>
        <Button
          variant="none"
          className="w-full hover:bg-indigo-50"
          onClick={() => handleOptionClick("/profile")}
        >
          <User size={18} />
          Profile
        </Button>
        <Button
          variant="none"
          className="w-full hover:bg-indigo-50"
          onClick={() => handleOptionClick("/profile#stores")}
        >
          <Store size={18} />
          My stores
        </Button>
        <Button
          variant="none"
          className="w-full hover:bg-red-50 text-red-400"
          onClick={handleLogout}
          disabled={loading}
        >
          <LogOut size={18} />
          {loading ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </Dropdown>
  );
};
