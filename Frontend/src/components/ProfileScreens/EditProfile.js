import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { FaUserAlt } from "react-icons/fa";
import { AiOutlineUpload } from "react-icons/ai";
import Loader from "../GeneralScreens/Loader";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/AuthContext";
import "../../Css/EditProfile.css";

const EditProfile = () => {
  const { activeUser, config } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [previousPhoto, setPreviousPhoto] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRemovePhoto = async (photoObj) => {
    try {
      await axios.post("/api/destroy", { public_id: photoObj.public_id });
      setPreviousPhoto("");
    } catch (err) {
      alert(err);
    }
  };

  const handleOpenWidget = async (e) => {
    e.preventDefault();
    try {
      const photo = e.target.files[0];
      setPhotoName(e.target.files[0].name);

      // delete the previous image
      if (previousPhoto) 
        handleRemovePhoto(previousPhoto); 

      if (!photo) return alert("File not exist.");

      if (photo.size > 1024 * 1024)
        // 1mb
        return alert("Size too large!");

      if (photo.type !== "image/jpeg" && photo.type !== "image/png")
        // 1mb
        return alert("File format is incorrect.");

      let formData = new FormData();
      formData.append("photo", photo);

      const res = await axios.post("/api/uploadPhoto", formData, config);
      setPreviousPhoto(res.data);
    } catch (err) {
      alert(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const tmpPhoto = {
      public_id: previousPhoto.public_id,
      url: previousPhoto.url,
    };

    const data = {
      username: username,
      email: email,
      photo: tmpPhoto,
    };

    try {
      await axios.post("/user/editProfile", data, config);

      setSuccess("Edit Profile successfully ");
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error) {
      setTimeout(() => {
        setError("");
      }, 7000);
      setError(error.response.data.error);
    }
  };

  useEffect(() => {
    setUsername(activeUser.username);
    setEmail(activeUser.email);
    setPreviousPhoto(activeUser.photo);
    setPhoto(activeUser.photo);
    setTimeout(() => {
      setLoading(false);
    }, 1050);
  }, [navigate, activeUser]);

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="Inclusive-editprofile-page">
          <form onSubmit={handleSubmit}>
            {error && <div className="error_msg">{error}</div>}

            {success && <div className="success_msg">{success} </div>}

            <div className="input-wrapper">
              <input
                type="text"
                id="username"
                placeholder="Username  "
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label htmlFor="username">Username</label>
            </div>

            <div className="input-wrapper">
              <input
                type="email"
                id="email"
                placeholder="Email  "
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="email">E-mail</label>
            </div>

            <div className="profile-ımg-upld-wrapper">
              <div className="ProfilePhotoField">
                <FaUserAlt />
                <div className="txt">
                  {photo === previousPhoto || !previousPhoto ? (
                    <div>
                      <AiOutlineUpload />
                      <span>Change Profile Photo</span>
                    </div>
                  ) : (
                    photoName
                  )}
                </div>
                <input
                  name="photo"
                  type="file"
                  onChange={(e) => handleOpenWidget(e)}
                />
              </div>

              <div className="currentImage">
                <div className="absolute">Current Photo</div>
                <img src={previousPhoto.url} alt="" />
                <span onClick={() => handleRemovePhoto(previousPhoto)}>X</span>
              </div>
            </div>

            <button type="submit" className="editprofile-btn">
              Edit Profile{" "}
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default EditProfile;
