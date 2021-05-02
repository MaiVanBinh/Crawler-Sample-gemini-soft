const crawlerServices = require("../services/crawlerPodbbang");
const { respWithData } = require("../utility/resCustom");
const crawlerAudioClipServices = require('../services/crawlerAudioclip');

exports.getPodBbang = async (req, res, next) => {
  try {
    await crawlerServices.getCategories();
    await crawlerServices.getPrograms();
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
        await crawlerAudioClipServices.getCategories();
        await crawlerAudioClipServices.getProgram();
        return res.status(200).json(
          respWithData(200, {
            message: "Crawler Success"
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
