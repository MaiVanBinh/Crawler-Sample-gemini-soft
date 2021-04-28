const axios = require("axios");
const Category = require("../models/category");
const Program = require("../models/program");
const Episode = require("../models/episode");
const { StringToMin } = require("../utility/stringConvert");
const fs = require('fs');

exports.getProgram = async (offset, category_id) => {
  try {
    let category = await Category.findOne({
      web_id: category_id,
      website: "podbbang",
    });

    if (!category) {
      const res = await axios.get(
        `http://www.podbbang.com/_api/categories/${category_id}/podcasts?offset=${offset}&limit=1&sort=subscribes`
      );
      if (res.data.data.length > 0) {
        category_name = res.data.data[0]["category"]["name"];
        category_web_id = res.data.data[0]["category"]["id"];
        const newCategory = new Category({
          title: category_name,
          website: "podbbang",
          web_id: category_web_id,
        });
        category = await newCategory.save();
      }
    }
    const res = await axios.get(
      `http://www.podbbang.com/_api/categories/${category_id}/podcasts?offset=${offset}&limit=100&sort=subscribes`
    );
    if (res.data.data.length > 0) {
      for (let i = 0; i < res.data.data.length; i++) {
        const name = res.data.data[i]["title"];
        const subcribe = res.data.data[i]["subscribes"];
        const website = "podbbang";
        const web_id = res.data.data[i]["id"];
        const category_id = category["_id"];
        const programCreated = await this.createProgram(
          name,
          subcribe,
          website,
          web_id,
          category_id
        );
        console.log("getProgram id: " + web_id);
        this.getEpisode(programCreated["_id"], web_id);
      }
      return true;
    }

    return false;
  } catch (err) {
    throw err;
  }
};

exports.createProgram = async (
  name,
  subcribe,
  website,
  web_id,
  category_id
) => {
  let program = await Program.findOne({ website: website, web_id: web_id });
  if (!program) {
    program = new Program({
      program_name: name,
      subcribe: subcribe,
      category_id: category_id,
      website: website,
      web_id: web_id,
    });
  } else {
    program.program_name = name;
    program.subcribe = subcribe;
  }
  return await program.save();
};

exports.getEpisode = async (program_id, program_web_id) => {
  try {
    const res = await axios.get(
      `http://www.podbbang.com/_m_api/podcasts/${program_web_id}/episodes?offset=0&sort=pubdate:desc&limit=10000&with=summary&cache=0`
    );
    if (res.data.data.length > 0) {
      for (let i = 0; i < res.data.data.length; i++) {
        const name = res.data.data[i]["title"];
        const upload_date = res.data.data[i]["published_at"];
        const like = res.data.data[i]["like_count"];
        const duration = res.data.data[i]["duration"] ? StringToMin(res.data.data[i]["duration"]) : null;
        if(isNaN(duration)) {
            duration = null;
            fs.writeFileSync('./log.txt', JSON.stringify(res.data.data[i]));
        }
        const play_count = null;
        const website = "podbbang";
        const web_id = res.data.data[i]["id"];
        console.log("getEpisode id: " + web_id);
        this.createEpisode(
          name,
          upload_date,
          like,
          duration,
          play_count,
          program_id,
          website,
          web_id
        );
      }
      return true;
    }

    return false;
  } catch (err) {
    throw err;
  }
};

exports.createEpisode = async (
  name,
  upload_date,
  like,
  duration,
  play_count,
  program_id,
  website,
  web_id
) => {
  let episode = await Episode.findOne({ website: website, web_id: web_id });
  if (!episode) {
    episode = new Episode({
      name: name,
      upload_date: upload_date,
      like: like,
      duration: duration,
      play_count: play_count,
      program_id: program_id,
      website: website,
      web_id: web_id,
    });
  } else {
    episode.name = name;
    episode.upload_date = upload_date;
    episode.like = like;
    episode.duration = duration;
    episode.play_count = play_count;
    episode.program_id = program_id;
  }
  await episode.save();
};

