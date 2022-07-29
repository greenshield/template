const express = require("express");
const router = express.Router();
const Moment = require("moment-timezone");
util = require("util");
var mongodb = require("mongodb");
var objectID = mongodb.ObjectId;

module.exports = function (app) {
  router.post("/find", async (req, res) => {
    var query = req.body.query;

    var search_term = query.search_term ? query.search_term : "";
    var page = query.page ? query.page : 0;

    if (req.body.box) {
      var match = {
        location: {
          $geoWithin: {
            $box: [
              [req.body.box[0].lng, req.body.box[0].lat],
              [req.body.box[1].lng, req.body.box[1].lat],
            ],
          },
        },
      };
    } else {
      match = {};
    }

    var _count = await app.db.collection("items").find(match).count();

    var ret = {};
    ret.total = _count;

    var results = await app.db
      .collection("items")
      .find(match)
      .limit(100)
      .toArray();
    ret.data = results;

    var s = ret.data.map((r, i) => {
      let rd = (({ ItemId }) => ({
        ItemId,
      }))(r);

      return rd;
    });

    ret.data = s;

    res.send(ret);
  });

  router.post("/search", async (req, res) => {
    var query = req.body.query;

    var search_term = query.search_term ? query.search_term : "";
    var page = query.page ? query.page : 0;
    var search_text =
      req.body.filters && req.body.filters.search_text
        ? req.body.filters.search_text
        : "";

    var match = {};

    var ors = [];

    var ands = [];

    if (search_term) {
      ors.push({
        LocationDescription: {
          $regex: new RegExp(".*" + search_term + ".*"),
          $options: "i",
        },
      });

      ors.push({
        ItemId: search_term,
      });

      ors.push({
        ZipCode: parseInt(search_term),
      });
    }

    if (search_text) {
      ands.push({
        Description: {
          $regex: new RegExp(".*" + search_text + ".*"),
          $options: "i",
        },
      });
    }

    if (!req.body.deleted) {
      ands.push({ deleted: { $nin: [true] } });
    }

    if (ors.length) {
      ands.push({ $or: ors });
    }

    if (ands.length) {
      match["$and"] = ands;
    }

    if (req.body.filters) {
      if (req.body.filters.highlighted) {
        match["$and"].push({
          highlighted: true,
        });
      }
    }

    if (req.body.filters.ItemType) {
      match["$and"].push({
        ItemType: req.body.filters.ItemType,
      });
    }

    if (req.body.filters.category) {
      match["$and"].push({
        category: { $in: req.body.filters.category },
      });
    }

    if (req.body.filters.price) {
      match["$and"].push({
        price: { $gte: req.body.filters.price[0] },
      });
      match["$and"].push({
        price: { $lte: req.body.filters.price[1] },
      });
    }

    var base_filter = [];

    if (req.body.filters && req.body.filters.favorites) {
      base_filter.push({
        $lookup: {
          from: "item_user",
          localField: "_id",
          foreignField: "item",
          as: "item_user",
        },
      });
      base_filter.push({
        $unwind: { path: "$item_user", preserveNullAndEmptyArrays: true },
      });

      var favorites = {
        "item_user.favorite": true,
      };

      match["$and"].push(favorites);

      if (req.auth_user) {
        match["$and"].push({ "item_user.user": req.auth_user._id });
      }
    }

    base_filter.push({
      $match: match,
    });
    base_filter.push({ $sort: { insert_stamp: -1 } });

    var total_filter = base_filter.concat([{ $count: "total" }]);

    var count_up = page * 100;
    var lim = 100 + count_up;

    var pagination = req.body.query.pagination;

    var data_filter = base_filter.concat([
      {
        $limit: pagination && pagination.limit ? pagination.limit : lim,
      },
      {
        $skip: pagination && pagination.skip ? pagination.skip : count_up,
      },
    ]);

    var filter = [];

    filter.push({
      $match: {
        display: true,
      },
    });

    if (req.body.box && !search_term) {
      filter.push({
        $match: {
          location: {
            $geoWithin: {
              $box: [
                [req.body.box[0].lng, req.body.box[0].lat],
                [req.body.box[1].lng, req.body.box[1].lat],
              ],
            },
          },
        },
      });
    }

    filter.push({
      $facet: {
        data: data_filter,
        total: total_filter,
      },
    });

    //console.log(JSON.stringify(filter, null, 2));

    return app.db
      .collection("items")
      .aggregate(filter, {
        allowDiskUse: true,
        OutputMode: "AggregateOutputMode.Cursor",
        collation: { locale: "en" },
      })
      .toArray()
      .then((item_list) => {
        var ret = {};
        ret.data = item_list[0].data.map(
          (
            {
              location,
              Description,
              LocationDescription,
              LocationSummary,
              category,
              ItemId,
              item_user,
              status,
              highlighted,
              photos,
            },
            i
          ) => {
            var ret = {
              location,
              Description,
              LocationDescription,
              LocationSummary,
              category,
              ItemId,
              item_user,
              status,
              highlighted,
            };
            if (photos && photos.length) {
              ret.photos = [photos[0]];
            }
            return ret;
          }
        );
        ret.total = item_list[0].total.length ? item_list[0].total[0].total : 0;

        res.send(ret);
      })
      .catch((err) => {});
  });

  router.post("/details", async (req, res) => {
    var query = req.body.query;

    match = { ItemId: query.ItemId };

    var item = await app.db.collection("items").findOne(match);

    if (req.auth_user) {
      match = { ItemId: query.ItemId, user: req.auth_user._id };

      var item_user = await app.db.collection("item_user").findOne(match);

      item.item_user = item_user;

      res.send(item);
    } else {
      res.send(item);
    }
  });

  router.post("/support", async (req, res) => {
    match = { ItemId: req.body.ItemId };

    var item = await app.db.collection("items").findOne(match);

    var uo = {
      $set: {
        item: item._id,
        user: req.auth_user._id,
        support: req.body.support,
      },
    };

    var filter = {
      ItemId: req.body.ItemId,
      user: req.auth_user._id,
    };

    app.db
      .collection("item_user")
      .updateMany(filter, uo, { upsert: true })
      .then((result) => {
        res.send({ status: true });
      });
  });

  router.post("/favorite", async (req, res) => {
    match = { ItemId: req.body.ItemId };

    var item = await app.db.collection("items").findOne(match);

    var uo = {
      $set: {
        item: item._id,
        user: req.auth_user._id,
        favorite: req.body.favorite,
      },
    };

    var filter = {
      ItemId: req.body.ItemId,
      user: req.auth_user._id,
    };

    app.db
      .collection("item_user")
      .updateMany(filter, uo, { upsert: true })
      .then((result) => {
        res.send({ status: true });
      });
  });

  router.post("/feedback", async (req, res) => {
    match = { ItemId: req.body.ItemId };

    var item = await app.db.collection("items").findOne(match);

    var uo = {
      $set: {
        item: item._id,
        user: req.auth_user._id,
        feedback: {
          status: "pending",
          name: req.body.feedback.name,
          details: req.body.feedback.details,
          email: req.body.feedback.email,
          phone: req.body.feedback.phone,
        },
      },
    };

    var filter = {
      ItemId: req.body.ItemId,
      user: req.auth_user._id,
    };

    app.db
      .collection("item_user")
      .updateMany(filter, uo, { upsert: true })
      .then((result) => {
        res.send({ status: true });
      });
  });

  router.post("/user", async (req, res) => {
    match = { ItemId: req.body.ItemId, user: req.auth_user._id };

    var item_user = await app.db.collection("item_user").findOne(match);
    res.send(item_user);
  });

  router.post("/savedsearches", async (req, res) => {
    match = { user: req.auth_user._id };

    var saved_searches = await app.db
      .collection("saved_searches")
      .find(match)
      .toArray();
    res.send(saved_searches);
  });

  router.post("/savesearch", async (req, res) => {
    delete req.body.filters.saved;
    delete req.body.filters.open;

    var title = Moment(new Date()).format("MM/DD/YYYY h:mm:ss a");

    var set = {
      user: req.auth_user._id,
      filters: req.body.filters,
    };

    if (!req.body.id) {
      set.title = req.body.title ? req.body.title : title;
    }

    var uo = {
      $set: set,
    };

    var filter = {
      user: req.auth_user._id,
    };

    if (req.body.id) {
      filter._id = objectID(req.body.id);
    } else {
      filter.insert_stamp = Moment(new Date()).valueOf();
    }

    app.db
      .collection("saved_searches")
      .updateMany(filter, uo, { upsert: true })
      .then(async (result) => {
        match = { user: req.auth_user._id };

        var saved_searches = await app.db
          .collection("saved_searches")
          .find(match)
          .toArray();
        res.send(saved_searches);
      });
  });

  return router;
};
