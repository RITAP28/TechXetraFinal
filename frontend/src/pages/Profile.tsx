import { useNavigate} from "react-router-dom";
import { useUser } from "../context/user_context";
import axios from "axios";
import { toast } from "react-toastify";
import QRCodeStyling from "qr-code-styling";
import { useEffect, useState } from "react";

export const createQRCode = (data: string) => {
    return new QRCodeStyling({
        width: 300,
        height: 300,
        margin: 10,
        data: `${import.meta.env.VITE_BASE_URL}/user/${data}`,
        qrOptions: {
            typeNumber: 0,
            mode: "Byte",
            errorCorrectionLevel: "H",
        },
        image: `/arrow.svg`,
        imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.4,
            margin: 0,
        },
        dotsOptions: {
            type: "extra-rounded",
            color: "#60a5fa",
        },
        backgroundOptions: {
            color: "#ffffff",
        },
        cornersSquareOptions: {
            type: "extra-rounded",
            color: "#3b82f6",
        },
        cornersDotOptions: {
            color: "#60a5fa",
        },
    });
};

const Profile = () => {
	const navigate = useNavigate();
	const userContext = useUser();
	const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

	const handleLogOut = async () => {
        try {
            await axios.get(`${import.meta.env.VITE_BASE_URL}/users/logout`, { withCredentials: true });
            userContext?.setUser(null);
            navigate("/login");
            toast.success("Logged Out");
        } catch (error: any) {
            toast.error(error.response.data.message);
        }
    }

	const handleDownload = () => {
        if (userContext?.user) {
            const qrCode = createQRCode(userContext?.user?._id);

            qrCode.download({
                name: userContext?.user?._id,
                extension: "png"
            });
        }
    }

	useEffect(() => {
        if (userContext?.user) {
            const qrCode = createQRCode(userContext?.user?._id);

            qrCode.getRawData("png").then((data) => {
                if (data) {
                    const dataUrl = URL.createObjectURL(new Blob([data], { type: "image/png" }));
                    setQrCodeDataUrl(dataUrl);
                }
            });
        }
    }, [userContext?.user]);

	return (
		<div className="flex max-sm:flex-col overflow-hidden sm:justify-center items-center h-screen bg-gradient-to-b from-[#1f021c] via-[#190341] to-[#22071b] text-white">
			<div className="bg-gray-900 rounded-lg max-sm:h-screen max-sm:w-screen shadow-lg p-8 sm:w-3/4 sm:max-w-4xl">
				{/* Profile Heading */}
				<h1 className="sm:text-5xl max-sm:text-5xl  font-extrabold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#FD8444] to-[#7527ED]">
					Profile
				</h1>

				<div className="flex max-sm:flex-col items-center justify-between space-x-8 max-sm:">
					{/* Left side: Avatar and user info */}
					<div className="flex max-sm:flex-col items-center space-x-8 max-sm:gap-5">
						{/* Avatar */}
						<img
							src={userContext?.user?.avatar}
							alt={`${userContext?.user?.firstName} ${userContext?.user?.lastName}`}
							className="sm:w-32 sm:h-32 max-sm:w-28 rounded-full shadow-md border-4 border-purple-500"
						/>

						{/* User Info */}
						<div className="max-sm:flex max-sm:flex-col max-sm:gap-1">
							<h1 className="text-4xl capitalize font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#FD8444] to-[#7527ED]">
								{userContext?.user?.firstName}{" "}{userContext?.user?.lastName}
							</h1>
							<p className="sm:text-lg mb-1">
								<span className="font-semibold">Email: </span>
								{userContext?.user?.email}
							</p>
							<p className="text-lg mb-1">
								<span className="font-semibold">Role: </span>
								{userContext?.user?.role}
							</p>
							<p className="text-lg mb-1">
								<span className="font-semibold">
									Account Types:{" "}
								</span>
								{userContext?.user?.account.join(", ")}
							</p>
							<p className="text-lg mb-1 capitalize">
								<span className="font-semibold">College: </span>
								{userContext?.user?.college}
							</p>
							<p className="text-lg mb-1">
								<span className="font-semibold">Phone: </span>
								{userContext?.user?.phoneNumber}
							</p>
							<p className="text-lg mb-1">
								<span className="font-semibold">
									Verified:{" "}
								</span>
								{userContext?.user?.isVerified ? (
									<span className="text-green-500">Yes</span>
								) : (
									<span className="text-red-500">No</span>
								)}
							</p>
							<p className="text-lg mb-1">
								<span className="font-semibold">Blocked: </span>
								{userContext?.user?.isBlocked ? (
									<span className="text-red-500">Yes</span>
								) : (
									<span className="text-green-500">No</span>
								)}
							</p>
						</div>
					</div>

					{/* Right side: QR Code */}
					<div className="flex-shrink-0">
						<img
							className="max-h-56 rounded-2xl"
							src={qrCodeDataUrl}
							alt="User QR Code"
						/>
					</div>
				</div>

				{/* Registered Events */}
				<div className="mt-8">
					<h2 className="text-2xl font-bold mb-4">
						Registered Events
					</h2>
					{userContext?.user?.events && userContext?.user?.events?.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{userContext?.user?.events.map((event, index) => (
								<div
									key={index}
									className="bg-gradient-to-r from-[#1f021c] via-[#190341] to-[#22071b] p-4 rounded-lg shadow-md"
								>
									<h3 className="text-xl font-semibold">
										Event {index + 1}
									</h3>
									<p className="mt-2">Event Name: {event.eventId}</p>
								</div>
							))}
						</div>
					) : (
						<p className="text-gray-500">No events registered</p>
					)}
				</div>

				<div className="mt-8 text-center">
					<button
						className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded"
						onClick={handleDownload}
					>
						Download QR
					</button>
				</div>

				{/* Logout Button */}
				<div className="mt-8 text-center">
					<button
						className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
						onClick={handleLogOut}
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	);
};

export default Profile;