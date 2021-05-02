const axios = require("axios");
const Category = require("../models/category");
const Program = require("../models/program");
const Episode = require("../models/episode");
const { StringToSecond } = require("../utility/stringConvert");
const fs = require("fs");
let cheerio = require("cheerio");
const WEBSITE = "podbbang";

exports.getCategories = async () => {
  try {
    const res = await axios.get("https://www.podbbang.com/categories/");
    let $ = cheerio.load(res.data);
    let categories = $("#categoryIndex > ul.category-list");
    let list = $(categories).find("li");
    let listCategory = [];
    for (let i = 0; i < list.length; i++) {
      let id = parseInt(
        $(list[i]).find("a")[0]["attribs"]["href"].split("/")[2]
      );
      let title = $(list[i]).find("a").text();
      await this.createCategory(title, id);
    }
    return listCategory;
  } catch (err) {
    throw err;
  }
};

exports.createCategory = async (title, origin_id) => {
  let category = await Category.findOne({
    origin_id: origin_id,
    website: WEBSITE,
  });
  if (!category) {
    category = new Category({
      title: title,
      website: WEBSITE,
      origin_id: origin_id,
    });
    await category.save();
  }
};

exports.getPrograms = async () => {
  try {
    const categories = await Category.find({ website: WEBSITE });
    for (let i = 0; i < categories.length; i++) {
      await this.getProgramByOriginCateId(categories[i]);
    }
  } catch (err) {
    throw err;
  }
};

exports.getProgramByOriginCateId = async (category) => {
  try {
    let offset = 0;
    let url;
    while (true) {
      url = `http://www.podbbang.com/_api/categories/${category["origin_id"]}/podcasts?offset=${offset}&limit=100&sort=subscribes`;
      const res = await axios.get(url);
      if (res.data.data.length > 0) {
        for (let i = 0; i < res.data.data.length; i++) {
          const title = res.data.data[i]["title"];
          const subcribe = res.data.data[i]["subscribes"];
          const origin_id = res.data.data[i]["id"];
          const category_id = category["_id"];
          const description = res.data.data[i]["description"];
          const programCreated = await this.createProgram(
            title,
            subcribe,
            WEBSITE,
            origin_id,
            category_id,
            description
          );
          console.log("getProgram id: " + origin_id);
          await this.getEpisode(programCreated["_id"], origin_id);
        }
      } else {
        break;
      }
      offset = offset + 1;
    }
  } catch (err) {
    fs.appendFileSync("./logs/getProgramByOriginCateId.txt", "\n");
    fs.appendFileSync("./logs/getProgramByOriginCateId.txt", JSON.stringify(err));
  }
};

exports.createProgram = async (
  title,
  subcribe,
  website,
  origin_id,
  category_id,
  description
) => {
  try {
    let program = await Program.findOne({
      website: website,
      origin_id: origin_id,
    });
    if (!program) {
      program = new Program({
        description: description,
        title: title,
        subcribe: subcribe,
        category_id: category_id,
        website: website,
        origin_id: origin_id,
      });
    } else {
      (program.description = description), (program.title = title);
      program.subcribe = subcribe;
    }
    return await program.save();
  } catch (err) {
    fs.appendFileSync("./logs/createProgram.txt", "\n");
    fs.appendFileSync("./logs/createProgram.txt", JSON.stringify(err));
  }
};

exports.getEpisode = async (program_id, program_origin_id) => {
  try {
    let offset = 0;
    while (true) {
      const res = await axios.get(
        `http://www.podbbang.com/_m_api/podcasts/${program_origin_id}/episodes?offset=${offset}&sort=pubdate:desc&limit=100&with=summary&cache=0`
      );
      if (res.data.data.length > 0) {
        for (let i = 0; i < res.data.data.length; i++) {
          const title = res.data.data[i]["title"];
          const description = res.data.data[i]["description"];
          const like = res.data.data[i]["like_count"];
          const duration = res.data.data[i]["duration"]
            ? StringToSecond(res.data.data[i]["duration"])
            : null;

          const upload_date = res.data.data[i]["published_at"];

          if (isNaN(duration)) {
            duration = null;
            fs.writeFileSync("./log.txt", JSON.stringify(res.data.data[i]));
          }
          const website = "podbbang";
          const origin_id = res.data.data[i]["id"];
          console.log("getEpisode id: " + origin_id);
          await this.createEpisode(
            title,
            description,
            like,
            duration,
            program_id,
            website,
            origin_id,
            upload_date,
            upload_date
          );
        }
      } else {
        break;
      }
      offset = offset + 1;
    }
  } catch (err) {
    console.log(err);
    fs.appendFileSync("./logs/getEpisode.txt", "\n");
    fs.appendFileSync("./logs/getEpisode.txt", JSON.stringify(err));
  }
};

exports.createEpisode = async (
  title,
  description,
  like,
  duration,
  program_id,
  website,
  origin_id,
  created_at,
  updated_at
) => {
  try {
    let episode = await Episode.findOne({
      website: website,
      origin_id: origin_id,
    });
    if (!episode) {
      episode = new Episode({
        description: description,
        title: title,
        like: like,
        duration: duration,
        program_id: program_id,
        website: website,
        origin_id: origin_id,
        created_at: created_at,
        updated_at: updated_at
      });
    } else {
      episode.description = description;
      episode.title = title;
      episode.like = like;
      episode.updated_at = updated_at;
      episode.duration = duration;
      episode.program_id = program_id;
    }
    await episode.save();
  } catch (err) {
    fs.appendFileSync("./logs/createEpisode.txt", "\n");
    fs.appendFileSync("./logs/createEpisode.txt", JSON.stringify(err));
  }
};
