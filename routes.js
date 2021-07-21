const AWS = require("aws-sdk");
const express = require("express");
const uuid = require("uuid");

const IS_OFFLINE = process.env.NODE_ENV !== "production";
const GRUBBER_USERS = process.env.TABLE_GRUBBER_USERS;
const GRUBBER_RESTAURANTS = process.env.TABLE_GRUBBER_RESTAURANTS;
const GRUBBER_DIETS = process.env.TABLE_GRUBBER_DIETS;
const NELLET_USERS = process.env.TABLE_NELLET_USERS;

const dynamoDb =
  IS_OFFLINE === true
    ? new AWS.DynamoDB.DocumentClient({
        region: "eu-west-2",
        endpoint: "http://127.0.0.1:8080",
      })
    : new AWS.DynamoDB.DocumentClient();

const router = express.Router();

//====================GRUBBER RESTAURANTS (Really only for queries to find the total or a specific one) NO PUT YET

router.get("/grubber/restaurants", (req, res) => {
  const params = {
    TableName: GRUBBER_RESTAURANTS,
  };
  dynamoDb.scan(params, (error, result) => {
    if (error) {
      res
        .status(400)
        .json({ error: "Error fetching the grubber data -- restaurants" });
    }
    res.json(result.Items);
  });
});

router.get("/grubber/restaurants/:id", (req, res) => {
  const id = req.params.id;

  const params = {
    TableName: GRUBBER_RESTAURANTS,
    Key: {
      id,
    },
  };

  dynamoDb.get(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Error retrieving grubber restaurant" });
    }
    if (result.Item) {
      res.json(result.Item);
    } else {
      res
        .status(404)
        .json({ error: `Grubber restaurant with id: ${id} not found` });
    }
  });
});

router.post("/grubber/restaurants", (req, res) => {
  const description = req.body.description;
  const restaurantName = req.body.restaurantName;
  const restaurantImages = req.body.restaurantImages;
  const url = req.body.url;
  const id = uuid.v4();

  const params = {
    TableName: GRUBBER_RESTAURANTS,
    Item: {
      id,
      description,
      restaurantName,
      restaurantImages,
      url,
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      res.status(400).json({ error: "Could not create Grubber restaurant" });
    }
    res.json({
      id,
      description,
      restaurantName,
      restaurantImages,
      url,
    });
  });
});

router.delete("/grubber/restaurants/:id", (req, res) => {
  const id = req.params.id;

  const params = {
    TableName: GRUBBER_RESTAURANTS,
    Key: {
      id,
    },
  };

  dynamoDb.delete(params, (error) => {
    if (error) {
      res.status(400).json({ error: "Could not delete Grubber restaurant" });
    }
    res.json({ success: true });
  });
});

//====================GRUBBER USERS

router.get("/grubber", (req, res) => {
  const params = {
    TableName: GRUBBER_USERS,
  };
  dynamoDb.scan(params, (error, result) => {
    if (error) {
      res
        .status(400)
        .json({ error: "Error fetching the grubber data -- users" });
    }
    res.json(result.Items);
  });
});

router.get("/grubber/:id", (req, res) => {
  const id = req.params.id;

  const params = {
    TableName: GRUBBER_USERS,
    Key: {
      id,
    },
  };

  dynamoDb.get(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Error retrieving grubber user" });
    }
    if (result.Item) {
      res.json(result.Item);
    } else {
      res.status(404).json({ error: `Grubber user with id: ${id} not found` });
    }
  });
});

router.post("/grubber", (req, res) => {
  const name = req.body.name;
  const id = uuid.v4();

  const params = {
    TableName: GRUBBER_USERS,
    Item: {
      id,
      name,
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      res.status(400).json({ error: "Could not create Grubber user" });
    }
    res.json({
      id,
      name,
    });
  });
});

router.get("/user/:id", (req, res) => {
  const id = req.params.id;

  const params = {
    TableName: NELLET_USERS,
    Key: {
      id,
    },
  };

  dynamoDb.get(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Error retrieving nellet user" });
    }
    if (result && result.Item) {
      console.log(result);
      res.json(result.Item);
    } else {
      res.status(404).json({ error: `Nellet user with id: ${id} not found` });
    }
  });
});

router.post("/nellet/user/register", (req, res) => {
  console.log("req for nellet: ", req.body);
  const defaultPreferences = { darkMode: false };
  const email = req.body.email ?? false;
  const profilePicture =
    req.body.profilePicture ??
    "http://www.quickmeme.com/img/4d/4d56e45853983bfeedced94719e78b2869e21252c3d85105f7b56320b8f959ab.jpg";
  const givenName = req.body.givenName ?? false;
  const familyName = req.body.familyName ?? false;
  const preferences = req.body.preferences ?? defaultPreferences;
  const id = req.body.sub ?? uuid.v4();
  const lastModified = req.body.updated_at ?? false;

  const params = {
    TableName: NELLET_USERS,
    Item: {
      id,
      email,
      profilePicture,
      givenName,
      familyName,
      preferences,
      lastModified,
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      res.status(400).json({ error: "Could not create nellet user" });
    }
    res.json({
      id,
    });
  });
});

router.delete("/grubber/:id", (req, res) => {
  const id = req.params.id;

  const params = {
    TableName: GRUBBER_USERS,
    Key: {
      id,
    },
  };

  dynamoDb.delete(params, (error) => {
    if (error) {
      res.status(400).json({ error: "Could not delete Grubber user" });
    }
    res.json({ success: true });
  });
});

router.put("/grubber/favorites/add", (req, res) => {
  const id = req.body.id;
  const favoritesRequested = req.body.favorites ?? [];
  var checked = false;

  const getFavoritesParams = {
    TableName: GRUBBER_USERS,
    Key: {
      id,
    },
  };

  dynamoDb.get(getFavoritesParams, (error, result) => {
    if (error) {
      res.status(400).json({
        error:
          "Error retrieving grubber user -- may result in overwrite of favorites",
      });
    }
    if (result.Item) {
      var f = result.Item.favorites ?? [];
      if (typeof f == "undefined") {
        f = [];
      }
      reduceFavoriteArr(f);
    } else {
      res.status(404).json({
        error: `Grubber user with id: ${id} not found - may result in overwrite of favorites`,
      });
    }
  });

  const reduceFavoriteArr = (data) => {
    var newData = data;
    if (!newData.length) {
      dataSendOff(favoritesRequested);
    } else {
      function filterData(cb) {
        newData.filter((a) => {
          if (checked == false) {
            if (a.id == favoritesRequested.id) {
              checked = true;
            }
          }
        });

        if (!checked) {
          newData.push(favoritesRequested);
        }
        return cb(null);
      }

      function cb(error) {
        if (error) {
          return;
        }
        dataSendOff(newData);
      }
      filterData(cb);
    }
  };

  const dataSendOff = (favorites) => {
    const params = {
      TableName: GRUBBER_USERS,
      Key: {
        id,
      },
      UpdateExpression: "set #favorites = :favorites",
      ExpressionAttributeNames: { "#favorites": "favorites" },
      ExpressionAttributeValues: { ":favorites": favorites },
      ReturnValues: "ALL_NEW",
    };

    dynamoDb.update(params, (error, result) => {
      if (error) {
        res
          .status(400)
          .json({ error: "Could not update Grubber user -- favaorites" });
      }
      res.json(result.Attributes);
    });
  };
});

router.put("/grubber/favorites/delete", (req, res) => {
  const id = req.body.id;
  const favoritesRequested = req.body.favorites ?? [];
  var checked = false;

  const getFavoritesParams = {
    TableName: GRUBBER_USERS,
    Key: {
      id,
    },
  };

  dynamoDb.get(getFavoritesParams, (error, result) => {
    if (error) {
      res.status(400).json({
        error:
          "Error retrieving grubber user -- may result in overwrite of favorites",
      });
    }
    if (result.Item) {
      var f = result.Item.favorites ?? [];
      if (typeof f == "undefined") {
        f = [];
      }
      reduceFavoriteArr(f);
    } else {
      res.status(404).json({
        error: `Grubber user with id: ${id} not found - may result in overwrite of favorites`,
      });
    }
  });

  const reduceFavoriteArr = (data) => {
    var newData = data;
    function filterData(cb) {
      newData.filter((a, index) => {
        if (checked == false) {
          if (a.id == favoritesRequested.id) {
            //for some odd reason if there's two instances
            checked = true;
            newData.splice(index, 1);
            return;
          }
        }
      });
      return cb(null);
    }

    function cb(error) {
      if (error) {
        return;
      }
      dataSendOff(newData);
    }
    filterData(cb);
  };

  //from that data filter ones that are there
  const dataSendOff = (favorites) => {
    const params = {
      TableName: GRUBBER_USERS,
      Key: {
        id,
      },
      UpdateExpression: "set #favorites = :favorites",
      ExpressionAttributeNames: { "#favorites": "favorites" },
      ExpressionAttributeValues: { ":favorites": favorites },
      ReturnValues: "ALL_NEW",
    };

    dynamoDb.update(params, (error, result) => {
      if (error) {
        res
          .status(400)
          .json({ error: "Could not update Grubber user favorites -- delete" });
      }
      res.json(result.Attributes);
    });
  };
});

//====================GRUBBER DIETS (Really only for queries to find the total or a specific one)
router.get("/grubber/diets", (req, res) => {
  const params = {
    TableName: GRUBBER_DIETS,
  };
  dynamoDb.scan(params, (error, result) => {
    if (error) {
      res
        .status(400)
        .json({ error: "Error fetching the grubber data -- diets" });
    }
    res.json(result.Items);
  });
});

module.exports = router;
