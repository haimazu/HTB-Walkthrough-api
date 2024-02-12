import React, { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import Loader from "../GeneralScreens/Loader";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import { AiOutlineUpload } from "react-icons/ai";
import "../../Css/EditStory.css";

import { Editor } from "@tinymce/tinymce-react";

const EditStory = () => {
  const { config } = useContext(AuthContext);
  const slug = useParams().slug;
  const [loading, setLoading] = useState(true);
  const [story, setStory] = useState({});
  const [image, setImage] = useState("");
  const [previousImage, setPreviousImage] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeMachine, setActiveMachine] = useState(false);
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [imageName, setImageName] = useState("");

  const editorRef = useRef(null);

  useEffect(() => {
    const getStoryInfo = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/story/editStory/${slug}`, config);
        setStory(data.data);
        setTitle(data.data.title);
        setContent(data.data.content);
        setImage(data.data.image);
        setPreviousImage(data.data.image);
        setActiveMachine(data.data.active);
        setLoading(false);
      } catch (error) {
        navigate("/");
      }
    };

    getStoryInfo();
  }, []);

  const handleRemoveImg = async (imgObj) => {
    try {
      await axios.post("/api/destroy", { public_id: imgObj.public_id });
      setPreviousImage("");
    } catch (err) {
      alert(err);
    }
  };

  const handleOpenWidget = async (e) => {
    e.preventDefault();
    try {
      const image = e.target.files[0];
      setImageName(e.target.files[0].name);

      // delete the previous image
      if (previousImage) handleRemoveImg(previousImage);

      if (!image) return alert("File not exist.");

      if (image.size > 1024 * 1024)
        // 1mb
        return alert("Size too large!");

      if (image.type !== "image/jpeg" && image.type !== "image/png")
        // 1mb
        return alert("File format is incorrect.");

      let formData = new FormData();
      formData.append("image", image);

      const res = await axios.post("/api/uploadImage", formData, config);
      setPreviousImage(res.data);
    } catch (err) {
      alert(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tmpImage = {
      public_id: previousImage.public_id,
      url: previousImage.url,
    };

    const data = {
      title: title,
      image: tmpImage,
      content: editorRef.current.getContent(),
      active: activeMachine,
      password: password,
    };

    try {
      await axios.put(`/story/${slug}/edit`, data, config);

      setSuccess("The article was successfully edited");

      setTimeout(() => {
        navigate("/");
      }, 2500);
    } catch (error) {
      setTimeout(() => {
        setError("");
      }, 4500);
      setError(error.response.data.error);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="Inclusive-editStory-page ">
          <form onSubmit={handleSubmit} className="editStory-form">
            {error && <div className="error_msg">{error}</div>}
            {success && (
              <div className="success_msg">
                <span>{success}</span>
                <Link to="/">Go home</Link>
              </div>
            )}

            <input
              type="text"
              required
              id="title"
              placeholder="Title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />

            <Editor
              onChange={(e) => console.log(editorRef.current.getContent())}
              onInit={(e, editor) => (editorRef.current = editor)}
              apiKey="m6ped3naks4huivjm7vg7vy86s3k6lc250sgcn20ydp0w1fz"
              initialValue={content}
              init={{
                height: 500,
                min_height: 500,
                width: "100%",
                menubar: false,
                plugins: [
                  "advlist autolink autoresize lists link image charmap print preview anchor",
                  "searchreplace visualblocks fullscreen codesample emoticons",
                  "insertdatetime media table paste help wordcount preview",
                ],
                toolbar:
                  "undo redo | formatselect | " +
                  "bold italic underline forecolor backcolor | image link codesample blockquote | " +
                  "bullist numlist | preview fullscreen | emoticons| alignleft aligncenter alignright alignjustify | " +
                  "| help",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                content_css: "",
                skin: "bootstrap",
              }}
            />

            {previousImage ? (
              <div className="currentImage">
                <div className="absolute">Current Image</div>
                <img src={previousImage.url} alt="storyImage" />
                <span onClick={() => handleRemoveImg(previousImage)}>X</span>
              </div>
            ) : (
              ""
            )}

            <div className="StoryImageField">
              <AiOutlineUpload />
              <div className="txt">
                {image === previousImage || !previousImage
                  ? "Upload new image"
                  : imageName}
              </div>
              <input
                name="image"
                type="file"
                onChange={(e) => handleOpenWidget(e)}
              />
            </div>

            <div className="active_machine">
              <h4>Active Machine:</h4>
              <div>
                <input
                  name="radio-item-1"
                  value={true}
                  type="radio"
                  onChange={(e) => setActiveMachine(e.target.value)}
                  defaultChecked={activeMachine === true}
                />
                <label htmlFor="radio-item-1">True</label>
              </div>

              <div>
                <input
                  name="radio-item-1"
                  value={false}
                  type="radio"
                  onChange={(e) => setActiveMachine(e.target.value)}
                  defaultChecked={activeMachine === false}
                />
                <label htmlFor="radio-item-2">False</label>
              </div>

              <div>
                <label htmlFor="password">
                  <b>Password (/etc/shadow):</b>
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="$y$j<<The rest>>"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  disabled={activeMachine ? false : true}
                />
              </div>
            </div>

            <button type="submit" className="editStory-btn">
              Edit Article{" "}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default EditStory;
