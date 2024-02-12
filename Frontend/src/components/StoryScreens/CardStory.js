import React from "react";
import { Link } from "react-router-dom";

import { BiCalendar } from "react-icons/bi";
// up arrow
import { BsArrowUpCircle } from "react-icons/bs";
// down arrow
import { BsArrowDownCircle } from "react-icons/bs";
// process
import { BiLoaderCircle } from "react-icons/bi";

const Story = ({ story }) => {
  const editDate = (createdAt) => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const d = new Date(createdAt);
    var datestring =
      d.getDate() +
      " " +
      monthNames[d.getMonth()].substring(0, 3) +
      " ," +
      d.getFullYear();
    return datestring;
  };

  const truncateTitle = (title) => {
    const trimmedString = title.substr(0, 20);
    return trimmedString;
  };

  const truncateContent = (content) => {
    const trimmedString = content.substr(0, 150);
    return trimmedString;
  };

  return (
    <div className="story-card">
      <div className="story-content-wrapper">
        <img className="story-image" src={story.image.url} alt={story.title} />
        <Link to={`/story/${story.slug}`} className="story-link">
          <h5 className="story-title">
            {story.title.length > 22
              ? truncateTitle(story.title) + "..."
              : story.title}
          </h5>
        </Link>

        <p>
          <>
            <b style={{ color: "#0275d8" }}>Machine status:&nbsp;</b>
            {story.active ? (
              <>
                <BsArrowUpCircle
                  style={{ background: "green", borderRadius: "50%" }}
                />
                &nbsp; (Active)
              </>
            ) : (
              <>
                <BsArrowDownCircle
                  style={{ background: "red", borderRadius: "50%" }}
                />
                &nbsp; (Retired)
              </>
            )}
          </>
        </p>

        <p
          className="story-text"
          dangerouslySetInnerHTML={{
            __html: truncateContent(story.content) + "...",
          }}
        ></p>

        <div className="story-author-container">
          <div className="story-author">
            <img
              src={
                "https://res.cloudinary.com/dzmau9ijh/image/upload/v1664804482/HackTheBox/userPhotos/chdqlct2zmkqozlhfkmr.png"
              }
              alt=""
            />
            <h6>Mikos</h6>
          </div>

          <div className="story-date">
            <BiCalendar
              style={{
                marginTop: "-4px",
                marginLeft: "3px",
                marginRight: "3px",
                fontSize: "22px",
              }}
            />
            {editDate(story.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Story;
