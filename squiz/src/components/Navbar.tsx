import { NavLink } from "react-router";
import { useClerk, UserButton, useUser, useAuth } from "@clerk/clerk-react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Clock04Icon,
  Cards02Icon,
  SearchSquareIcon,
  SearchAreaIcon,
  Add01Icon,
  AirplayLineIcon,
  Book01Icon,
  DashboardCircleEditIcon,
} from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import SelectQuizForRoomModal from "../components/SelectQuizForRoomModal";
import CreateQuizModal from "../components/CreateQuizModal";

export default function Navbar() {
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [isSelectQuizModalOpen, setIsSelectQuizModalOpen] = useState(false);
  const [isCreateQuizModalOpen, setIsCreateQuizModalOpen] = useState(false);

  const [lastScrollY, setLastScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  const [showShadow, setShowShadow] = useState(false);

  // Add useEffect to handle user creation
  useEffect(() => {
    const createUserInDatabase = async () => {
      if (!user) return;

      try {
        console.log("Starting user sync process...");
        console.log("Current user from Clerk:", {
          id: user.id,
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          imageUrl: user.imageUrl,
        });

        const token = await getToken();
        if (!token) {
          console.error("No authentication token available");
          return;
        }

        // Always try to create user first
        try {
          console.log("Attempting to create user in database...");
          const createResponse = await fetch(
            "http://localhost:5000/api/users",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                _id: user.id,
                name: user.fullName,
                email: user.primaryEmailAddress?.emailAddress,
                role: user.publicMetadata.role,
                imageUrl: user.imageUrl,
              }),
            }
          );

          const createData = await createResponse.json();
          console.log("Create user response:", createData);

          if (createResponse.ok) {
            console.log("Successfully created user in database");
          } else if (createResponse.status === 409) {
            console.log("User already exists in database");

            // Update existing user's information
            const updateResponse = await fetch(
              `http://localhost:5000/api/users/${user.id}`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  name: user.fullName,
                  email: user.primaryEmailAddress?.emailAddress,
                  imageUrl: user.imageUrl,
                }),
              }
            );

            if (updateResponse.ok) {
              console.log("Successfully updated existing user");
            } else {
              console.error(
                "Failed to update existing user:",
                await updateResponse.text()
              );
            }
          } else {
            console.error(
              "Failed to create user:",
              createData.message || "Unknown error"
            );
          }
        } catch (error) {
          console.error("Error during user creation/update:", error);
        }
      } catch (error) {
        console.error("Error in user sync process:", error);
      }
    };

    if (user) {
      console.log("User detected, starting database sync...");
      createUserInDatabase();
    }
  }, [user, getToken]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Ẩn nav khi cuộn xuống
      if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setVisible(false);
        setShowShadow(false);
      }
      // Hiện nav + bóng khi cuộn lên (trừ khi ở đầu trang)
      else if (currentScrollY < lastScrollY && currentScrollY > 10) {
        setVisible(true);
        setShowShadow(true);
      }
      // Ở đầu trang: hiện nav nhưng không bóng
      else if (currentScrollY <= 10) {
        setVisible(true);
        setShowShadow(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <>
      <nav
        className={`h-16 fixed z-50 bg-background left-0 right-0 py-2 px-8 flex justify-between items-center transition-all duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        } ${showShadow ? "shadow-md" : "shadow-none"}`}
      >
        <div className="flex items-center gap-5">
          <NavLink to="/">
            <h1 className="text-3xl font-black">Squizz</h1>
          </NavLink>
          <form className="w-80">
            <label
              htmlFor="default-search"
              className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-gray-300"
            >
              Search
            </label>
            <div className=" flex border-orange rounded-lg border-1">
              <div className="flex inset-y-0 items-center pl-2 pointer-events-none">
                <HugeiconsIcon icon={SearchAreaIcon} />
              </div>
              <input
                type="search"
                id="default-search"
                className="block p-2 w-full text-sm "
                placeholder="Tìm Squiz..."
                required
              />
              <button
                type="submit"
                className="bg-orange font-medium rounded-e-lg p-2"
              >
                <HugeiconsIcon icon={SearchSquareIcon} size={26} />
              </button>
            </div>
          </form>
          <NavLink
            to="/dashboard/home"
            className={({ isActive }) =>
              `flex h-12 items-center gap-2 px-3 font-bold text-xl btn-hover ${
                isActive ? "btn-active text-orange" : ""
              }`
            }
          >
            <HugeiconsIcon icon={Home01Icon} />
            <p>Trang chủ</p>
          </NavLink>

          {user && (
            <NavLink
              to="/dashboard/activity"
              className={({ isActive }) =>
                `flex h-12 items-center gap-2 px-3 font-bold text-xl btn-hover ${
                  isActive ? "btn-active text-orange" : ""
                }`
              }
            >
              <HugeiconsIcon icon={Clock04Icon} />
              <p>Hoạt động</p>
            </NavLink>
          )}
          {user && (
            <NavLink
              to="/dashboard/my-quiz/"
              className={({ isActive }) =>
                `flex h-12 items-center gap-2 px-3 font-bold text-xl btn-hover ${
                  isActive ? "btn-active text-orange" : ""
                }`
              }
            >
              <HugeiconsIcon icon={Cards02Icon} />
              <p>Quiz của bạn</p>
            </NavLink>
          )}

          {user &&
            (user.publicMetadata.role === "teacher" ||
              user.publicMetadata.role === "admin") && (
              <NavLink
                to="/dashboard/room-manager/"
                className={({ isActive }) =>
                  `flex h-12 items-center gap-2 px-3 font-bold text-xl btn-hover ${
                    isActive ? "btn-active text-orange" : ""
                  }`
                }
              >
                <HugeiconsIcon icon={AirplayLineIcon} />
                <p>Quản lý phòng thi</p>
              </NavLink>
            )}

          {user &&
            (user.publicMetadata.role === "teacher" ||
              user.publicMetadata.role === "admin") && (
              <NavLink
                to="/dashboard/exam-bank/"
                className={({ isActive }) =>
                  `flex h-12 items-center gap-2 px-3 font-bold text-xl btn-hover ${
                    isActive ? "btn-active text-orange" : ""
                  }`
                }
              >
                <HugeiconsIcon icon={Book01Icon} />
                <p>Ngân hàng đề thi</p>
              </NavLink>
            )}
          {user && user.publicMetadata.role === "admin" && (
            <NavLink
              to="/dashboard/admin/"
              className={({ isActive }) =>
                `flex h-12 items-center gap-2 px-3 font-bold text-xl btn-hover ${
                  isActive ? "btn-active text-orange" : ""
                }`
              }
            >
              <HugeiconsIcon icon={DashboardCircleEditIcon} />
              <p>Quản lý tài khoản</p>
            </NavLink>
          )}
        </div>
        <div className="flex items-center gap-5">
          {user &&
            (user.publicMetadata.role === "teacher" ||
              user.publicMetadata.role === "admin") && (
              <button
                onClick={() => setIsSelectQuizModalOpen(true)}
                className="flex bg-gray-100 btn-hover items-center gap-2 py-2 px-3 rounded font-semibold text-lg"
              >
                <HugeiconsIcon icon={Add01Icon} size={20} />
                <p>Tạo phòng</p>
              </button>
            )}
          {user && (
            <button
              onClick={() => setIsCreateQuizModalOpen(true)}
              className="flex bg-orange btn-hover items-center gap-2 py-2 px-3 rounded font-semibold text-lg"
            >
              <HugeiconsIcon icon={Add01Icon} size={20} />
              <p>Tạo một Squiz</p>
            </button>
          )}
          {user ? (
            <UserButton />
          ) : (
            <div onClick={() => openSignIn()}>
              <div className="p-3 cursor-pointer bg-orange btn-hover rounded font-semibold text-lg">
                <p>Đăng nhập</p>
              </div>
            </div>
          )}
        </div>
      </nav>

      <SelectQuizForRoomModal
        isOpen={isSelectQuizModalOpen}
        onClose={() => setIsSelectQuizModalOpen(false)}
      />

      <CreateQuizModal
        isOpen={isCreateQuizModalOpen}
        onClose={() => setIsCreateQuizModalOpen(false)}
      />
    </>
  );
}
