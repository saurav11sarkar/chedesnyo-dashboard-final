import Link from 'next/link';
import React from 'react';

function SettingsPage() {
    return (
        <div className="w-full mt-6 space-y-4">
            {/* Profile Tab Button */}
            <div>
                <Link href="/profile">
                    <div>
                        <button className="w-full flex items-center gap-3 px-6 py-4 bg-[#C8E6C9] text-gray-900 rounded-lg font-medium justify-start shadow-md hover:bg-[#b0d9b2] transition-colors">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Profile
                        </button>
                    </div>
                </Link>
            </div>

            <div>
                {/* Change Password Tab Button */}
                <Link href="/update-password">
                    <div>
                        <button className="w-full flex items-center gap-3 px-6 py-4 bg-[#E1F5FE] text-gray-900 rounded-lg font-medium justify-start shadow-md hover:bg-[#c3e9fd] transition-colors">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M12 17v-4" />
                                <path d="M12 7h.01" />
                                <path d="M5 21h14a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2h-1V9a5 5 0 0 0-10 0v3H5a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2z" />
                            </svg>
                            Change Password
                        </button>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default SettingsPage;
