import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { Link, useLocation } from 'react-router-dom';
import { useClerk, UserButton, useUser } from '@clerk/clerk-react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Navbar = () => {
    const { navigate, isEducator, backendURL, setIsEducator, getToken } = useContext(AppContext);
    const location = useLocation();
    const isCourseListPage = location.pathname.includes('/courses-list');

    const { openSignIn } = useClerk();
    const { user } = useUser();

    const becomeEducator = async () => {
        try {
            if (!user) {
                toast.error("You must be logged in to become an educator");
                return;
            }

            if (isEducator) {
                navigate('/educator');
                return;
            }

            const token = await getToken();
            const { data } = await axios.get(`${backendURL}/api/educator/update-role`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                setIsEducator(true);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        }
    };

    return (
        <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${isCourseListPage ? 'bg-white' : 'bg-cyan-100/70'}`}>
            <img
                onClick={() => navigate('/')}
                src={assets.logo}
                alt="Logo"
                className='w-28 lg:w-32 cursor-pointer'
            />

            {/* Desktop */}
            <div className='hidden md:flex items-center gap-5 text-gray-500'>
                <div className='flex items-center gap-5'>
                    {user &&
                        <>
                            <button onClick={becomeEducator} className='px-3 py-1 bg-black-500 text-gray rounded'>
                                {isEducator ? 'Educator Dashboard' : 'Become Educator'}
                            </button>
                            | <Link to='/my-enrollments'>My Enrollments</Link>
                        </>
                    }
                </div>
                {user ? <UserButton /> :
                    <button onClick={() => openSignIn()} className='bg-blue-600 text-white px-5 py-2 rounded-full'>
                        Create Account
                    </button>
                }
            </div>

            {/* Mobile */}
            <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
                <div className='flex items-center gap-1 sm:gap-2 max-sm:text-xs'>
                    {user &&
                        <>
                            <button onClick={becomeEducator} className='px-2 py-1 bg-black-500 text-gray rounded'>
                                {isEducator ? 'Educator Dashboard' : 'Become Educator'}
                            </button>
                            | <Link to='/my-enrollments'>My Enrollments</Link>
                        </>
                    }
                </div>
                {user ? <UserButton /> :
                    <button onClick={() => openSignIn()}>
                        <img src={assets.user_icon} alt="User Icon" />
                    </button>
                }
            </div>
        </div>
    );
};

export default Navbar;
