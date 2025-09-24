import { useContext,useState,createContext, useEffect } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import humanizeDuration from "humanize-duration";
import {useAuth,useUser} from "@clerk/clerk-react";
import axios from "axios";
import {toast} from "react-toastify";



export const AppContext = createContext();

export const AppContextProvider = (props) =>{

    const backendURL= import.meta.env.VITE_BACKEND_URL;

    const currency= import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();

    const {getToken} = useAuth();
    const {user} = useUser();

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(false);
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [userData, setUserData] = useState(null);


    const fetchAllCourses = async () => {
        try{
           const {data} =  await axios.get(backendURL+'/api/course/all');
            
           if(data.success){
                setAllCourses(data.courses);
           }else{
                toast.error(data.message);
           }
            
        }catch(error){
            toast.error(error.message);
        }
    };

    //Fetch User Data
    const fetchUserData = async () => {

        if(user.publicMetadata.role === 'educator'){
            setIsEducator(true);
        }


        try {
            const token = await getToken();
            console.log(token);

            const {data} = await axios.get(backendURL + '/api/user/data', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            if(data.success){
                setUserData(data.user);
            }else{
                toast.error(data.message);
            }

        }catch(error){
            toast.error(error.message);
        }
    };

  

    //clac avg. rating
   const calculateRating = (course) => {
  if (!course || !course.courseRatings || course.courseRatings.length === 0) {
    return 0;
  }
  const total = course.courseRatings.reduce((acc, r) => acc + r.rating, 0);
  return Math.floor(total / course.courseRatings.length);
};

    //Function to calculate course chapter time
    const calculateChapterTime = (chapter) => {
        let time = 0
        chapter.chapterContent.map((lecture) => {
            time += lecture.lectureDuration;
        });
        return humanizeDuration(time*60*1000,{units:[ "h", "m"]});

    };

    //function to calculate course duration
    const calculateCourseDuration = (course) => {
        let time = 0
        course.courseContent.map((chapter) => {
            chapter.chapterContent.map((lecture) => {
                time += lecture.lectureDuration;
            });
        });
        return humanizeDuration(time*60*1000,{units:[ "h", "m"]});
    };

    //function to claculate No. of lecture in the course

    const calculateNoOfLectures = (course) => {
        let totalLectures = 0;
        course.courseContent.forEach((chapter) => {
            if(Array.isArray(chapter.chapterContent)) {
                totalLectures += chapter.chapterContent.length;
            }
        });
        return totalLectures;
    };

    //Fetch User Enrolled Courses

    const fetchUserEnrolledCourses = async () => {
        try{
            const token = await getToken();
            const {data} = await axios.get(backendURL+'/api/user/enrolled-courses',{
                headers:{
                    Authorization: `Bearer ${token}`,
                }
            });
            if(data.success){
                setEnrolledCourses(data.enrolledCourses.reverse());
            }else{
                toast.error(data.message);
            }
        }catch(error){
            toast.error(error.message);
        }
};

    useEffect(() => {
        fetchAllCourses();
    }, []);

   

    useEffect(() => {
        if(user){
            fetchUserData();
            fetchUserEnrolledCourses();
        }
    }, [user]);

    const value = {
        currency,
        allCourses,
        navigate,
        calculateRating,
        isEducator,
        setIsEducator,
        calculateChapterTime,
        calculateCourseDuration,
        calculateNoOfLectures,
        enrolledCourses,
        fetchUserEnrolledCourses,
        backendURL,
        userData,
        setUserData,
        getToken,
        fetchAllCourses
    }
    return (
        <AppContext.Provider value={value}>
        {props.children}
        </AppContext.Provider>
    );
};
