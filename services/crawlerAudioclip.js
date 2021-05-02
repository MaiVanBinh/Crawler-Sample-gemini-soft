const axios = require("axios");
const Category = require("../models/category");
const Program = require("../models/program");
const Episode = require("../models/episode");
const { StringToMin, stringToDate } = require("../utility/stringConvert");
const fs = require("fs");
const WEBSITE = "audioclip";
const LINKS = require("../utility/link");
const { cpuUsage } = require("process");

exports.getCategories = async () => {
  try {
    const res = await axios.get(LINKS["Link"][WEBSITE]["categories"]);
    if (res.data.length > 0) {
      const data = res.data;
      for (let i = 0; i < data.length; i++) {
        await this.createCategory(
          data[i]["categoryName"],
          data[i]["categoryNo"]
        );
      }
    }
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

exports.getProgram = async () => {
  try {
    const categories = await Category.find({ website: WEBSITE });
    for (let i = 0; i < categories.length; i++) {
      await this.getProgramByOriginCateId(categories[i]);
    }
  } catch (err) {
    fs.appendFileSync("./logs/getProgram.txt", "\n");
    fs.appendFileSync("./logs/getProgram.txt", JSON.stringify(err));
  }
};

exports.getProgramByOriginCateId = async (category) => {
  try {
    let totalResult = 0;
    const res1 = await axios.get(
      `https://audioclip.naver.com/api/categories/${category["origin_id"]}/channels?sortType=DESC&sortKey=episodeApprovalYmdt&offset=0&limit=15`
    );

    totalResult = parseInt(res1.data["totalCount"]);
    const res = await axios.get(
      `https://audioclip.naver.com/api/categories/${category["origin_id"]}/channels?sortType=DESC&sortKey=episodeApprovalYmdt&offset=0&limit=${totalResult}`
    );
    if (res.data.channels.length > 0) {
      for (let i = 0; i < res.data.channels.length; i++) {
        const title = res.data.channels[i]["channelName"];
        const subcribe = res.data.channels[i]["subscribedCount"];
        const origin_id = res.data.channels[i]["channelNo"];
        const category_id = category["_id"];
        const description = res.data.channels[i]["description"];
        const programCreated = await this.createProgram(
          title,
          subcribe,
          WEBSITE,
          origin_id,
          category_id,
          description
        );
        console.log("getProgram id: " + origin_id);
        await this.processPagination(programCreated["_id"], origin_id);
      }
    }
  } catch (err) {
    fs.appendFileSync("./logs/getProgramByOriginCateId.txt", "\n");
    fs.appendFileSync("./getProgramByOriginCateId.txt", JSON.stringify(err));
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

exports.processPagination = async (program_id, program_origin_id) => {
  let after = "null";
  let url;
  let episodes;
  while (true) {
    if (after == "null") {
      url = `https://audioclip.naver.com/api/channels/${program_origin_id}/episodes?sortType=DESC&sortKey=approvalYmdt`;
    } else {
      url = `https://audioclip.naver.com/api/channels/${program_origin_id}/episodes?sortType=DESC&sortKey=approvalYmdt&after=${after}&limit=100`;
    }
    res = await this.getEpisode(url);
    episodes = res.episodes;
    if (after == "null") {
      after = parseInt(res.after);
    } else {
      after = after - 100;
    }
    if (after < -100) {
      break;
    }
    fs.appendFileSync("./logs/orders.txt", "\n");
    fs.appendFileSync("./logs/orders.txt",'program_origin_id: ' + program_origin_id + "\nafter: " + after + "\nurl: " + url);
    await this.createListEpisode(program_id, program_origin_id, episodes);
  }
};

exports.getEpisode = async (url) => {
  try {
    let res = await axios.get(url);
    const episodes = res.data["episodes"];
    if (episodes) {
      return {
        episodes: episodes,
        after: res.data["cursors"]["after"],
      };
    }
    return false;
  } catch (err) {
    fs.appendFileSync("./logs/getEpisode.txt", "\n");
    fs.appendFileSync("./logs/getEpisode.txt", JSON.stringify(err));
  }
};

exports.createListEpisode = async (program_id, program_origin_id, episodes) => {
  for (let i = 0; i < episodes.length; i++) {
    const origin_id = episodes[i]["audioId"];
    const title = episodes[i]["episodeTitle"];
    const description = episodes[i]["description"];
    const created_at = stringToDate(episodes[i]["registTimestamp"]);
    const updated_at = stringToDate(episodes[i]["modifyTimestamp"]);
    const episodeNo = episodes[i]["episodeNo"];
    const like = await this.getLikesCount(episodeNo, program_origin_id);
    const duration = episodes[i]["playTime"]
      ? parseFloat(episodes[i]["playTime"])
      : null;
    if (isNaN(duration)) {
      duration = null;
      fs.appendFileSync("./logs/log.txt", JSON.stringify(episodes[i]));
    }
    const website = WEBSITE;
    const play_count = await this.getPlayCount(origin_id);
    console.log("getEpisode id: " + origin_id);
    this.createEpisode(
      title,
      description,
      like,
      duration,
      play_count,
      program_id,
      website,
      origin_id,
      created_at,
      updated_at,
      episodeNo
    );
  }
};

exports.createEpisode = async (
  title,
  description,
  like,
  duration,
  play_count,
  program_id,
  website,
  origin_id,
  created_at,
  updated_at,
  episodeNo
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
        play_count: play_count,
        program_id: program_id,
        website: website,
        origin_id: origin_id,
        created_at: created_at,
        updated_at: updated_at,
        episode_no: episodeNo,
      });
    } else {
      episode.description = description;
      episode.title = title;
      episode.like = like;
      episode.updated_at = updated_at;
      episode.duration = duration;
      episode.play_count = play_count;
      episode.program_id = program_id;
    }
    await episode.save();
  } catch (err) {
    fs.appendFileSync("./logs/createEpisode.txt", "\n");
    fs.appendFileSync("./logs/createEpisode.txt", JSON.stringify(err));
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
    fs.appendFileSync("./logs/getPlayCount.txt", "\n");
    fs.appendFileSync("./logs/getPlayCount.txt", JSON.stringify(err));
  }
};

exports.getLikesCount = async (ep_origin_id, pro_origin_id) => {
  try {
    const url = `https://audioclip.naver.com/api/feedbacks/counts?contentsId=CH_${pro_origin_id}_EP_${ep_origin_id}`;
    const res = await axios.get(url);
    if (res.data.length > 0) {
      return parseInt(res.data[0]["likeCount"]);
    }
    return 0;
  } catch (err) {
    fs.appendFileSync("./logs/getLikesCount.txt", "\n");
    fs.appendFileSync("./logs/getLikesCount.txt", JSON.stringify(err));
  }
};
