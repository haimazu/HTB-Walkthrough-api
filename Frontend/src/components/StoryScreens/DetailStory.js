import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "../../Css/DetailStory.css";
import Loader from "../GeneralScreens/Loader";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { FaRegComment } from "react-icons/fa";
import { BsBookmarkPlus, BsThreeDots, BsBookmarkFill } from "react-icons/bs";
import CommentSidebar from "../CommentScreens/CommentSidebar";

const DetailStory = () => {
  const [likeStatus, setLikeStatus] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [activeUser, setActiveUser] = useState({});
  const [story, setStory] = useState({});
  const [storyLikeUser, setStoryLikeUser] = useState([]);
  const [sidebarShowStatus, setSidebarShowStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const slug = useParams().slug;
  const [storyReadListStatus, setStoryReadListStatus] = useState(false);
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [accessContent, setAccessContent] = useState(false);

  useEffect(() => {
    const getDetailStory = async () => {
      setLoading(true);
      var activeUser = {};
      try {
        const { data } = await axios.get("/auth/private", {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        activeUser = data.user;

        setActiveUser(activeUser);
      } catch (error) {
        setActiveUser({});
      }

      try {
        const { data } = await axios.post(`/story/${slug}`, { activeUser });
        setStory(data.data);
        setLikeStatus(data.likeStatus);
        setLikeCount(data.data.likeCount);
        setStoryLikeUser(data.data.likes);
        setLoading(false);

        const story_id = data.data._id;

        if (activeUser.readList) {
          if (!activeUser.readList.includes(story_id)) {
            setStoryReadListStatus(false);
          } else {
            setStoryReadListStatus(true);
          }
        }
      } catch (error) {
        setStory({});
        navigate("/not-found");
      }
    };
    getDetailStory();
  }, [slug, setLoading]);

  const handleLike = async () => {
    setTimeout(() => {
      setLikeStatus(!likeStatus);
    }, 1500);

    try {
      const { data } = await axios.post(
        `/story/${slug}/like`,
        { activeUser },
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setLikeCount(data.data.likeCount);
      setStoryLikeUser(data.data.likes);
    } catch (error) {
      setStory({});
      localStorage.removeItem("authToken");
      navigate("/");
    }
  };

  const handleRemoveImg = async (imgObj) => {
    try {
      await axios.post("/api/destroy", { public_id: imgObj.public_id });
    } catch (err) {
      alert(err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Do you want to delete this post")) {
      handleRemoveImg(story.image);
      try {
        await axios.delete(`/story/${slug}/delete`, {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        navigate("/");
      } catch (error) {
        console.log(error);
      }
    }
  };

  const editDate = (createdAt) => {
    const d = new Date(createdAt);
    var datestring =
      d.getDate() +
      " " +
      d.toLocaleString("eng", { month: "long" }).substring(0, 3);
    return datestring;
  };

  const passwordHandler = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post("/auth/machinecontent", {
        password,
        slug,
      });

      setTimeout(() => {
        setPassword("");
        setAccessContent(true);
      }, 1800);
    } catch (error) {
      setPassword("");
      alert("Incorrect password");
      console.log(error);
    }
  };

  const addStoryToReadList = async () => {
    try {
      const { data } = await axios.post(
        `/user/${slug}/addStoryToReadList`,
        { activeUser },
        {
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      setStoryReadListStatus(data.status);

      document.getElementById("readListLength").textContent =
        data.user.readListLength;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          {!activeUser ? (
            <div className="error_msg">
              To leave me a comment or give a like, you must be registered.
            </div>
          ) : (
            ""
          )}
          <div className="inclusive-detailStory-page">
            <div className="top_detail_wrapper">
              <h5>{story.title}</h5>

              <div className="story-general-info">
                <ul>
                  {story.author && (
                    <li className="story-author-info">
                      <img
                        src={story.author.photo.url}
                        alt={story.author.username}
                      />
                      <span
                        className="story-author-username"
                        style={{ marginTop: "2px" }}
                      >
                        {story.author.username}{" "}
                      </span>
                    </li>
                  )}
                  <li className="story-createdAt">
                    {editDate(story.createdAt)}
                  </li>
                  {/* <b>-</b> */}

                  {/* <li className="story-readtime">{story.readtime} min read</li> */}
                </ul>

                {!activeUser.username && (
                  <div className="comment-info-wrap">
                    <i
                      onClick={(prev) => {
                        setSidebarShowStatus(!sidebarShowStatus);
                      }}
                    >
                      <FaRegComment />
                    </i>

                    <b className="commentCount">{story.commentCount}</b>
                  </div>
                )}

                {activeUser &&
                story.author &&
                story.author._id === activeUser._id ? (
                  <div className="top_story_transactions">
                    <Link to={`/story/${story.slug}/edit`}>
                      <FiEdit />
                    </Link>
                    <span onClick={handleDelete}>
                      <RiDeleteBin6Line />
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="CommentFieldEmp">
              <CommentSidebar
                slug={slug}
                sidebarShowStatus={sidebarShowStatus}
                setSidebarShowStatus={setSidebarShowStatus}
                activeUser={activeUser}
              />
            </div>

            <div className="story-content">
              <div className="story-banner-img">
                <img src={story.image.url} alt={story.title} />
              </div>

              {/* If the machine not active -> show content */}
              {story.active === false || accessContent === true ? (
                <div
                  className="content"
                  dangerouslySetInnerHTML={{ __html: story.content }}
                ></div>
              ) : (
                <div>
                  <form onSubmit={passwordHandler}>
                    <div className="error_msg">
                      <h1>Protected Content</h1>
                      <hr />
                      <h5>
                        This machine is active, enter the root hash to see the
                        content. <br />
                        <br />
                        If it's a Windows machine, send me email with proof that
                        you succeeded, and I'll send you the password. <br />
                        <br />
                        My email: mikoshtb9@gmail.com
                      </h5>
                    </div>

                    <div className="input_wrapper">
                      <label htmlFor="password">
                        <b>Password (/etc/shadow):</b>
                      </label>
                      <input
                        type="password"
                        required
                        id="password"
                        placeholder="$y$j<<The rest>>"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                        tabIndex={2}
                      />
                      <button className="enter_btn">Enter</button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {activeUser.username && (
              <div className="fixed-story-options">
                <ul>
                  <li>
                    <i onClick={handleLike}>
                      {likeStatus ? (
                        <FaHeart color="#0063a5" />
                      ) : (
                        <FaRegHeart />
                      )}
                    </i>

                    <b
                      className="likecount"
                      style={
                        likeStatus
                          ? { color: "#0063a5" }
                          : { color: "rgb(99, 99, 99)" }
                      }
                    >
                      {" "}
                      {likeCount}
                    </b>
                  </li>

                  <li>
                    <i
                      onClick={(prev) => {
                        setSidebarShowStatus(!sidebarShowStatus);
                      }}
                    >
                      <FaRegComment />
                    </i>

                    <b className="commentCount">{story.commentCount}</b>
                  </li>
                </ul>

                <ul>
                  <li>
                    <i onClick={addStoryToReadList}>
                      {storyReadListStatus ? (
                        <BsBookmarkFill color="#0205b1" />
                      ) : (
                        <BsBookmarkPlus />
                      )}
                    </i>
                  </li>

                  <li className="BsThreeDots_opt">
                    <i>
                      <BsThreeDots />
                    </i>

                    {activeUser && story.author._id === activeUser._id ? (
                      <div className="delete_or_edit_story  ">
                        <Link
                          className="editStoryLink"
                          to={`/story/${story.slug}/edit`}
                        >
                          <p>Edit Story</p>
                        </Link>
                        <div className="deleteStoryLink" onClick={handleDelete}>
                          <p>Delete Story</p>
                        </div>
                      </div>
                    ) : null}
                  </li>
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default DetailStory;
