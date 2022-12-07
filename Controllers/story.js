const asyncErrorWrapper = require("express-async-handler");
const Story = require("../Models/story");
const deleteImageFile = require("../Helpers/Libraries/deleteImageFile");
const {
  searchHelper,
  paginateHelper,
} = require("../Helpers/query/queryHelpers");

const cloudinary = require("cloudinary");
const dotenv = require("dotenv");

dotenv.config({
  path: "../../config.env",
});

// Upload image on cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const addStory = asyncErrorWrapper(async (req, res, next) => {
  try {
    const { title, image, content, active, password } = req.body;

    var wordCount = content.trim().split(/\s+/).length;

    let readtime = Math.floor(wordCount / 200);
    
    const newStory = new Story({
      title,
      content,
      author: req.user._id,
      image,
      readtime,
      active,
      password,
    });

    await newStory.save();
    return res.status(200).json({ message: "Created a story" });

  } catch (error) {
    res.status(500).json({ msg: error });
  }
});

const getAllStories = asyncErrorWrapper(async (req, res, next) => {
  let query = Story.find();

  query = searchHelper("title", query, req);

  const paginationResult = await paginateHelper(Story, query, req);

  query = paginationResult.query;

  query = query.sort("-likeCount -commentCount -createdAt");

  const stories = await query;

  return res.status(200).json({
    success: true,
    count: stories.length,
    data: stories,
    page: paginationResult.page,
    pages: paginationResult.pages,
  });
});

const detailStory = asyncErrorWrapper(async (req, res, next) => {
  const { slug } = req.params;
  const { activeUser } = req.body;

  const story = await Story.findOne({
    slug: slug,
  }).populate("author likes");

  const storyLikeUserIds = story.likes.map((json) => json.id);
  const likeStatus = storyLikeUserIds.includes(activeUser._id);

  return res.status(200).json({
    success: true,
    data: story,
    likeStatus: likeStatus,
  });
});

const likeStory = asyncErrorWrapper(async (req, res, next) => {
  const { activeUser } = req.body;
  const { slug } = req.params;

  const story = await Story.findOne({
    slug: slug,
  }).populate("author likes");

  const storyLikeUserIds = story.likes.map((json) => json._id.toString());

  if (!storyLikeUserIds.includes(activeUser._id)) {
    story.likes.push(activeUser);
    story.likeCount = story.likes.length;
    await story.save();
  } else {
    const index = storyLikeUserIds.indexOf(activeUser._id);
    story.likes.splice(index, 1);
    story.likeCount = story.likes.length;

    await story.save();
  }

  return res.status(200).json({
    success: true,
    data: story,
  });
});

const editStoryPage = asyncErrorWrapper(async (req, res, next) => {
  const { slug } = req.params;

  const story = await Story.findOne({
    slug: slug,
  }).populate("author likes");

  return res.status(200).json({
    success: true,
    data: story,
  });
});

const editStory = asyncErrorWrapper(async (req, res, next) => {
  const { slug } = req.params;
  const { title, content, image, active, password } = req.body;

  const story = await Story.findOne({ slug: slug });

  story.title = title;
  story.content = content;
  story.image = image;
  story.active = active;

  if (active === true && password !== "") {
    story.password = password;
  }

  await story.save();

  return res.status(200).json({
    success: true,
    data: story,
  });
});

const deleteStory = asyncErrorWrapper(async (req, res, next) => {
  const { slug } = req.params;

  const story = await Story.findOne({ slug: slug });

  await story.remove();

  return res.status(200).json({
    success: true,
    message: "Story delete succesfully ",
  });
});

module.exports = {
  addStory,
  getAllStories,
  detailStory,
  likeStory,
  editStoryPage,
  editStory,
  deleteStory,
};
