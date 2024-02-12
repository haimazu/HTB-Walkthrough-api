import { useEffect, useState } from "react";
import { IoIosArrowUp } from "react-icons/io";
import "../Css/ScrollToTop.css";

const ScrollToTop = () => {
  // The back-to-top button is hidden at the beginning
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    });
  }, []);

  // This function will scroll the window to the top
  const scroll = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // for smoothly scrolling
    });
  };

  return (
    <>
      {showButton && (
        <button onClick={scroll} className="back-to-top">
          <IoIosArrowUp className="back-to-top-icon"
          />
        </button>
      )}
    </>
  );
};

export default ScrollToTop;
