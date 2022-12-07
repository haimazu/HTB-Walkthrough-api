const mongoose = require("mongoose");
const Comment = require("./comment");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");

const StorySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    slug: String,
    title: {
      type: String,
      required: [true, "Please provide a title"],
      unique: true,
      minlength: [4, "Please provide a title least 4 characters "],
    },
    content: {
      type: String,
      required: [true, "Please a provide a content "],
      minlength: [10, "Please provide a content least 10 characters "],
    },
    image: {
      type: Object,
      require: true,
    },
    readtime: {
      type: Number,
      default: 3,
    },
    likes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Comment",
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: false,
      enum: [true, false],
    },
    password: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

StorySchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password !== ""
    ? (this.password = await bcrypt.hash(this.password, salt))
    : (this.password = "");
  next();
});

StorySchema.pre("save", function (next) {
  if (!this.isModified("title")) {
    next();
  }

  this.slug = this.makeSlug();

  next();
});

StorySchema.pre("remove", async function (next) {
  const story = await Story.findById(this._id);

  await Comment.deleteMany({
    story: story,
  });
});

StorySchema.methods.makeSlug = function () {
  return slugify(this.title, {
    replacement: "-",
    remove: /[*+~.()'"!:@/?]/g,
    lower: true,
    strict: false,
    locale: "tr",
    trim: true,
  });
};

const Story = mongoose.model("Story", StorySchema);

module.exports = Story;
