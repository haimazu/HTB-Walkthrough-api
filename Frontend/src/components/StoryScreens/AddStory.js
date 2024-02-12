import React, { useRef, useState, useContext } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import { AiOutlineUpload } from "react-icons/ai";
import "../../Css/AddStory.css";

import { Editor } from "@tinymce/tinymce-react";

const AddStory = () => {
  const { config } = useContext(AuthContext);
  const editorEl = useRef(null);
  const [image, setImage] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeMachine, setActiveMachine] = useState(false);
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [imageName, setImageName] = useState("");

  const editorRef = useRef(null);
  const navigate = useNavigate();

  const clearInputs = () => {
    setTitle("");
    setContent("");
    setImage(false);
    setActiveMachine(false);
    setPassword("");
    //editorEl.current.editor.setData("");
    //imageEl.current.value = "";
  };

  const handleRemoveImg = async (imgObj) => {
    try {
      await axios.post("/api/destroy", { public_id: imgObj.public_id });
      setImage("");
    } catch (err) {
      alert(err);
    }
  };

  const handleOpenWidget = async (e) => {
    e.preventDefault();
    try {
      const image = e.target.files[0];
      setImageName(e.target.files[0].name);

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
      setImage(res.data);
    } catch (err) {
      alert(err);
    }
    // var myWidget = window.cloudinary.createUploadWidget(
    //   {
    //     cloudName: "dzmau9ijh",
    //     uploadPreset: "p868gtjy",
    //   },
    //   (error, result) => {
    //     if (!error && result && result.event === "success") {
    //       setImage({ public_id: result.info.public_id, url: result.info.secure_url });
    //       //console.log("Done! Here is the image info: ", result.info);
    //     }
    //   }
    // );
    // // Open widget
    // myWidget.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tmpImage = {
      public_id: image.public_id,
      url: image.url,
    };

    const data = {
      title: title,
      image: tmpImage,
      content: editorRef.current.getContent(),
      active: activeMachine,
      password: password,
    };

    try {
      await axios.post("/story/addstory", data, config);

      setSuccess("The article has been successfully added");

      clearInputs();

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (error) {
      setTimeout(() => {
        setError("");
      }, 2500);
      setError(error);
    } finally {
      setTimeout(() => {
        navigate("/");
      }, 2500);
    }
  };

  return (
    <div className="Inclusive-addStory-page ">
      <form onSubmit={handleSubmit} className="addStory-form">
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
          placeholder="Add Your Title Here..."
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />

        <Editor
          onChange={(e) => console.log(editorRef.current.getContent())}
          onInit={(e, editor) => (editorRef.current = editor)}
          apiKey="m6ped3naks4huivjm7vg7vy86s3k6lc250sgcn20ydp0w1fz"
          initialValue=""
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

        {image ? (
          <div className="currentImage">
            <div className="absolute">Current Image</div>
            <img src={image.url} alt="storyImage" />{" "}
            <span onClick={() => handleRemoveImg(image)}>X</span>
          </div>
        ) : (
          ""
        )}

        <div className="StoryImageField">
          <AiOutlineUpload />
          <div className="txt">{image ? imageName : "Upload Image"}</div>
          <input
            type="file"
            name="file"
            id="file_up"
            onChange={(e) => handleOpenWidget(e)}
            //onChange={(e) => setImage(e.target.files[0])}
          />
          {/* <button onClick={() => handleOpenWidget()}>Upload Image</button> */}
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

        <button
          type="submit"
          disabled={image ? false : true}
          className={image ? "addStory-btn" : "dis-btn"}
        >
          Publish{" "}
        </button>
      </form>
    </div>
  );
};

export default AddStory;
