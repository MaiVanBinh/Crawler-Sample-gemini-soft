const axios = require("axios");
const Category = require("../models/category");
const Program = require("../models/program");
const Episode = require("../models/episode");
const { StringToMin, stringToDate } = require("../utility/stringConvert");
const fs = require("fs");
const WEBSITE = "audioclip";

exports.getProgram = async (category_id) => {
  try {
    let category = await Category.findOne({
      web_id: category_id,
      website: WEBSITE,
    });
    let totalResult = 0;
    const res1 = await axios.get(
      `https://audioclip.naver.com/api/categories/${category_id}/channels?sortType=DESC&sortKey=episodeApprovalYmdt&offset=0&limit=15`
    );
    if (!category) {
      const newCategory = new Category({
        title: res1.data["categoryName"],
        website: WEBSITE,
        web_id: category_id,
      });
      category = await newCategory.save();
    }
    totalResult = parseInt(res1.data["totalCount"]);
    const res = await axios.get(
      `https://audioclip.naver.com/api/categories/${category_id}/channels?sortType=DESC&sortKey=episodeApprovalYmdt&offset=0&limit=${totalResult}`
    );
    if (res.data.channels.length > 0) {
      for (let i = 0; i < res.data.channels.length; i++) {
        const name = res.data.channels[i]["channelName"];
        const subcribe = res.data.channels[i]["subscribedCount"];
        const web_id = res.data.channels[i]["channelNo"];
        const category_id = category["_id"];
        const programCreated = await this.createProgram(
          name,
          subcribe,
          WEBSITE,
          web_id,
          category_id
        );
        console.log("getProgram id: " + web_id);
        this.getEpisode(programCreated["_id"], web_id);
      }
    }
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
      `https://audioclip.naver.com/api/channels/${program_web_id}/episodes?sortType=ASC&limit=10000`
    );
    if (res.data["episodes"].length > 0) {
      for (let i = 0; i < res.data.episodes.length; i++) {
        const name = res.data.episodes[i]["episodeTitle"];
        const upload_date = stringToDate(
          res.data.episodes[i]["registTimestamp"]
        );
        const like = res.data.episodes[i]["like_count"];
        const duration = res.data.episodes[i]["playTime"]
          ? parseFloat(res.data.episodes[i]["playTime"]) / 60
          : null;
        if (isNaN(duration)) {
          duration = null;
          fs.appendFileSync("./log.txt", JSON.stringify(res.data.data[i]));
        }

        const website = WEBSITE;
        const web_id = res.data.episodes[i]["audioId"];
        const play_count = await this.getPlayCount(web_id);
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
  try {
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
  } catch (err) {
    console.log(err);
  }
};

exports.getPlayCount = async (episodeId) => {
  try {
    const res = await axios.get(
      `https://audioclip.naver.com/api/audioinfra/playcount?audioIds=${episodeId}`
    );
    if (res.data.audioIds.length > 0) {
      return parseInt(res.data.audioIds[0]["playCount"]);
    }
    return 0;
  } catch (err) {
    console.log(err);
  }
};
