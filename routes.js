const AWS = require("aws-sdk");
const express = require("express");
const uuid = require("uuid");

const IS_OFFLINE = process.env.NODE_ENV !== "production";
const GRUBBER_USERS = process.env.TABLE_GRUBBER_USERS;
const GRUBBER_RESTAURANTS = process.env.TABLE_GRUBBER_RESTAURANTS;
const GRUBBER_DIETS = process.env.TABLE_GRUBBER_DIETS;

const dynamoDb =
  IS_OFFLINE === true
    ? new AWS.DynamoDB.DocumentClient({
        region: "eu-west-2",
        endpoint: "http://127.0.0.1:8080",
      })
    : new AWS.DynamoDB.DocumentClient();

const router = express.Router();

//====================GRUBBER RESTAURANTS (Really only for queries to find the total or a specific one)

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

/*
router.put("/grubber", (req, res) => {
  const restaurantName = req.body.restaurantName;
  const restaurantImages = req.body.restaurantImages;
  const url = req.body.url;
  const id = req.body.id;

  const params = {
    TableName: GRUBBER_RESTAURANTS,
    Key: {
      id,
    },
    UpdateExpression: "set #name = :name",
    ExpressionAttributeNames: { "#name": "name" },
    ExpressionAttributeValues: { ":name": name },
    ReturnValues: "ALL_NEW",
  };

  dynamoDb.update(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Could not update Grubber user" });
    }
    res.json(result.Attributes);
  });
});
*/

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
  const name = req.body.name;
  const favorites = req.body.favorites ?? []; //testing out a nullish coalescing op + this is not the entire favortie sobject you should only be passing back the id
  var favoritesArr = []; //this is our favorites collector
  // const diet = req.body.diet ?? [];

  //from here grab the current array of favorites.
  //may have to put into a promise --------

  const getFavoritesParams = {
    TableName: GRUBBER_USERS,
    Key: {
      id,
    },
  };

  dynamoDb.get(getFavoritesParams, (error, result) => {
    if (error) {
      res
        .status(400)
        .json({
          error:
            "Error retrieving grubber user -- may result in overwrite of favorites",
        });
    }
    if (result.Item) {
      res.json(result.Item);
      favoritesArr = result.Item;
    } else {
      res
        .status(404)
        .json({
          error: `Grubber user with id: ${id} not found - may result in overwrite of favorites`,
        });
    }
  });

  console.log("LOOK PIERRE!", favoritesArr);

  //from that data filter ones that are there

  const params = {
    TableName: GRUBBER_USERS,
    Key: {
      id,
    },
    UpdateExpression: "set #name = :name, #favorites = :favorites",
    ExpressionAttributeNames: { "#name": "name", "#favorites": "favorites" },
    ExpressionAttributeValues: { ":name": name, ":favorites": favorites },
    ReturnValues: "ALL_NEW",
  };

  dynamoDb.update(params, (error, result) => {
    if (error) {
      res.status(400).json({ error: "Could not update Grubber user" });
    }
    res.json(result.Attributes);
  });
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
