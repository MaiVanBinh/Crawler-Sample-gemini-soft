const crawlerServices = require("../services/crawler");
const { respWithData } = require("../utility/resCustom");
const crawlerAudioClipServices = require('../services/crawlerAudioclip');

exports.getPodBbang = async (req, res, next) => {
  try {
    let offset = 0;
    const category = parseInt(req.params.id);
    while (true) {
      const data = await crawlerServices.getProgram(offset, category);
      offset = offset + 1;
      if (!data) {
        break;
      }
    }
    return res.status(200).json(
      respWithData(200, {
        message: "Create success",
      })
    );
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    console.log(err);
    next(err);
  }
};

exports.getAutoClip = async (req, res, next) => {
    try {
        const category = parseInt(req.params.id);
        await crawlerAudioClipServices.getProgram(category);
        return res.status(200).json(
          respWithData(200, {
            message: "Create success",
          })
        );
      } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        console.log(err);
        next(err);
      }
};
