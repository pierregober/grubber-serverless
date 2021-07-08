const AWS = require("aws-sdk");
const express = require("express");
const uuid = require("uuid");

const IS_OFFLINE = process.env.NODE_ENV !== "production";
const GRUBBER_USERS = process.env.TABLE_GRUBBER_USERS;
const GRUBBER_RESTAURANTS = process.env.TABLE_GRUBBER_RESTAURANTS;

const dynamoDb =
  IS_OFFLINE === true
    ? new AWS.DynamoDB.DocumentClient({
        region: "eu-west-2",
        endpoint: "http://127.0.0.1:8080",
      })
    : new AWS.DynamoDB.DocumentClient();

const router = express.Router();

//====================GRUBBER RESTAURANTS

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

router.put("/grubber", (req, res) => {
  const id = req.body.id;
  const name = req.body.name;

  const params = {
    TableName: GRUBBER_USERS,
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

module.exports = router;
