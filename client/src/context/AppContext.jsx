import { useContext,useState,createContext, useEffect } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import humanizeDuration from "humanize-duration";



export const AppContext = createContext();

export const AppContextProvider = (props) =>{

    const currency= import.meta.env.VITE_CURRENCY;
    const navigate = useNavigate();

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(true);
    const [enrolledCourses, setEnrolledCourses] = useState([]);

    const fetchAllCourses = async () => {
        setAllCourses(dummyCourses);
    };

    //clac avg. rating
   const calculateRating = (course) => {
  if (!course || !course.courseRatings || course.courseRatings.length === 0) {
    return 0;
  }
  const total = course.courseRatings.reduce((acc, r) => acc + r.rating, 0);
  return total / course.courseRatings.length;
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
        setEnrolledCourses(dummyCourses);
    };

    useEffect(() => {
        fetchAllCourses();
        fetchUserEnrolledCourses();
    }, []);

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
        fetchUserEnrolledCourses
    }
    return (
        <AppContext.Provider value={value}>
        {props.children}
        </AppContext.Provider>
    );
};
