var mongoose            = require('mongoose');
var StreetModel         = require('./street.model');
var UserModel           = require('../user/user.model');
var NeighborhoodModel   = require('../neighborhood/neighborhood.model');
var streetService       = require('../../service/streetService');
var userService         = require('../../service/userService')
var logger              = require('../../components/logger');

var Schema = mongoose.Schema;

exports.index = function(req, res, next) {
  streetService.getAll.then(function(streets)
  {
    res.status(200).json(streets);
  },
  function(error)
  {
    logger.error("streetController.index " + error);
    res.status(500).send(error);
  })
  .catch(function(error) {
    logger.error("streetController.index " + error);
    res.status(500).send(error);
  });
};

exports.get = function(req, res, next) {
  var streetId = req.params.sid;

  streetService.getById(streetId).then(function(street)
  {
    res.status(200).json(street);
  },
  function(error)
  {
    logger.error("streetController.get " + error);    
    res.status(500).send(error);
  })
  .catch(function(error) {
    logger.error("streetController.get " + error);    
    res.status(500).send(error);
  });
};

exports.getByNeighborhood = function(req, res, next) {
  var neighborhoodId = req.params.nid;

  streetService
    .getByNeighborhoodId(neighborhoodId)
    .then(function(streets)
    {
      res.status(200).json(streets);
    },
    function(error)
    {
      logger.error("streetController.getByNeighborhood " + error); 
      res.status(500).send(error);
    })
    .catch(function(error) {
      logger.error("streetController.getByNeighborhood " + error); 
      res.status(500).send(error);
    });
};

exports.currentUserStreets = function(req, res, next) {
    var userId = req.user._id;

    if (!userId) throw new Error('Required userId needs to be set');

    streetService.getByUserId(userId).then(
    function(result) {
      res.status(200).json(result);
    },
    function(error) {
      logger.error("streetController.currentUserStreetsGeoJSON " + error);    
      res.status(500).json("Street retrieval failed");
    })
    .catch(function(error) {
      logger.error("streetController.currentUserStreetsGeoJSON " + error);    
      res.status(500).json("Street retrieval failed");
    });
};

exports.currentUserStreetsGeoJSON = function(req, res, next) {
    var userId = req.user._id;

    if (!userId) throw new Error('Required userId needs to be set');

    streetService.getGeoJSONByUserId(userId).then(
    function(result) {
      res.status(200).json(result);
    },
    function(error) {
      logger.error("streetController.currentUserStreetsGeoJSON " + error);    
      res.status(500).json("Street retrieval failed");
    })
    .catch(function(error) {
      logger.error("streetController.currentUserStreetsGeoJSON " + error);    
      res.status(500).json("Street retrieval failed");
    });
};

exports.getByLocation = function(req, res, next) {
    var locationLat = req.body.lat;
    var locationLng = req.body.lng;

    var user = {};
    //Get user info
    if (typeof req.user !== 'undefined') {
      userService.getUserById(req.user._id, true).then(function(user) {
        streetService.getByLocation(locationLat, locationLng, user).then(function (streets)
        {
          res.status(200).json(streets);
        },
        function(error){
          logger.error("streetController.getByLocation " + error);              
          res.status(500).json("Search failed");          
        })
        .catch(function(error) {
          logger.error("streetController.getByLocation " + error);              
          res.status(500).json("Search failed");   
        });
      },
      function (error) {
        logger.error("streetController.getByLocation " + error);                      
        res.status(500).json("Search failed");
      })
      .catch(function(error) {
        logger.error("streetController.getByLocation " + error);              
        res.status(500).json("Search failed");   
      });
    }
    else 
    {
       streetService.getByLocation(locationLat, locationLng).then(function (streets)
        {
          res.status(200).json(streets);
        },
        function(error){
          logger.error("streetController.getByLocation " + error);                                
          res.status(500).json("Search failed");          
        })
        .catch(function(error) {
          logger.error("streetController.getByLocation " + error);                                
          res.status(500).json("Search failed");     
        });
    }
};

exports.getByLocationPaged = function(req, res, next) {
    var locationLat = req.body.lat;
    var locationLng = req.body.lng;
    var page = parseInt(req.params.page);
    var take = parseInt(req.params.take);

    var user = {};
    if (typeof req.user !== 'undefined') {
      userService.getUserById(req.user._id, true).then(function(user) {
        streetService.getByLocationPaged(locationLat, locationLng, page, take, user).then(
        function (result)
        {
          res.status(200).json(result);
        },
        function(error){
          logger.error("streetController.getByLocationPaged " + error);                                          
          res.status(500).json("Search failed");          
        })
        .catch(function(error) {
          logger.error("streetController.getByLocationPaged " + error);                                                  
          res.status(500).json("Search failed");
        });
      },
      function (error) {
        logger.error("streetController.getByLocationPaged " + error);                                                  
        res.status(500).json("Search failed");
      })
      .catch(function(error) {
        logger.error("streetController.getByLocationPaged " + error);                                                  
        res.status(500).json("Search failed");
      });
    }
    else 
    {
      streetService.getByLocationPaged(locationLat, locationLng, page, take).then(
      function (result)
      {
        res.status(200).json(result);
      },
      function(error){
        logger.error("streetController.getByLocationPaged " + error);                                                          
        res.status(500).json("Search failed");          
      })
      .catch(function(error) {
        logger.error("streetController.getByLocationPaged " + error);                                                          
        res.status(500).json("Search failed");       
      });
    }
};

exports.getGeoJSONByLocation = function(req, res, next) {
    var locationLat = req.body.lat;
    var locationLng = req.body.lng;

    if (!locationLat) throw Error("Latitude is missing");
    if (!locationLng) throw Error("Longtitude is missing");    

    locationLat = parseFloat(locationLat);
    locationLng = parseFloat(locationLng);

    var user = {};
    //Get user info
    if (typeof req.user !== 'undefined') {
      userService.getUserById(req.user._id, true).then(function(user) {
        streetService.getGeoJSONByLocation(locationLat, locationLng, user).then(function (streets)
        {
          res.status(200).json(streets);
        },
        function(error){
          logger.error("streetController.getGeoJSONByLocation " + error);              
          res.status(500).json("Search failed");          
        })
        .catch(function(error) {
          logger.error("streetController.getGeoJSONByLocation " + error);                      
          res.status(500).json("Search failed");
        });
      },
      function (error) {
        logger.error("streetController.getGeoJSONByLocation " + error);                      
        res.status(500).json("Search failed");
      })
      .catch(function(error) {
        logger.error("streetController.getGeoJSONByLocation " + error);                      
        res.status(500).json("Search failed");
      });
    }
    else 
    {
       streetService.getGeoJSONByLocation(locationLat, locationLng).then(function (streets)
        {
          res.status(200).json(streets);
        },
        function(error){
          logger.error("streetController.getGeoJSONByLocation " + error);                                
          res.status(500).json("Search failed");          
        })
        .catch(function(error) {
          logger.error("streetController.getGeoJSONByLocation " + error);                                
          res.status(500).json("Search failed");      
        }); 
    }
};

exports.getAllGeojson = function(req, res, next) {
    if (typeof req.user !== 'undefined') {
        streetService.getAllGeoJSON(user).then(
                                          function (streets)
                                          {
                                            res.status(200).json(streets);
                                          },
                                          function(error){
                                            logger.error("streetController.getAllGeojson " + error);                                                                    
                                            res.status(500).json("Streets retrieval failed");          
                                          })
                                          .catch(function(error) {
                                            logger.error("streetController.getAllGeojson " + error);                                                                    
                                            res.status(500).json("Streets retrieval failed");  
                                          });
    }
    else 
    {
       streetService.getAllGeoJSON().then(
                                          function (streets)
                                          {
                                            res.status(200).json(streets);
                                          },
                                          function(error){
                                            logger.error("streetController.getAllGeojson " + error);                                                                    
                                            res.status(500).json("Streets retrieval failed");          
                                          })
                                          .catch(function(error) {
                                            logger.error("streetController.getAllGeojson " + error);                                                                    
                                            res.status(500).json("Streets retrieval failed");   
                                          });
    }
};

exports.getByNeighborhoodGeojson = function(req, res, next) {
    var neighborhoodId = req.params.nid;

    if (typeof req.user !== 'undefined') {
      userService.getUserById(req.user._id, true).then(function(user) {
        streetService.getGeoJSONByNeighborhoodId(neighborhoodId, user).then(
        function (streets)
        {
          res.status(200).json(streets);
        },
        function(error){
          logger.error("streetController.getByNeighborhoodGeojson " + error);                                                                    
          res.status(500).json("Streets retrieval by neighborhood failed");          
        })
        .catch(function(error) {
          logger.error("streetController.getByNeighborhoodGeojson " + error);    
          res.status(500).json("User retrieval failed");   
        });
      },
      function (error) {
        logger.error("streetController.getByNeighborhoodGeojson " + error);    
        res.status(500).json("User retrieval failed");
      })
      .catch(function(error) {
        logger.error("streetController.getByNeighborhoodGeojson " + error);    
        res.status(500).json("User retrieval failed");   
      });
    }
    else 
    {
      streetService.getGeoJSONByNeighborhoodId(neighborhoodId).then(
      function (streets)
      {
        res.status(200).json(streets);
      },
      function(error){
        logger.error("streetController.getByNeighborhoodGeojson " + error);            
        res.status(500).json("Streets retrieval by neighborhood failed");          
      })
      .catch(function(error) {
        logger.error("streetController.getByNeighborhoodGeojson " + error);            
        res.status(500).json("Streets retrieval by neighborhood failed"); 
      });
    }
};

exports.reconcileAdoptedStreets = function(req, res, next) {
  streetService.reconcileAdoptedStreets().then(
    function(result) {
      res.status(200).json(result);
    },
    function(error)
    {
      logger.error("streetController.reconcileAdoptedStreets " + error);                  
      res.status(500).json("Adopted streets reconciliation failed");    
    }
  )
  .catch(function(error) {
    logger.error("streetController.reconcileAdoptedStreets " + error);                  
    res.status(500).json("Adopted streets reconciliation failed");    
  });
}

exports.adopt = function(req, res, next) {
    var user = req.user;
    var streetId = req.params.sid;

    if (!user) throw new Error('Required userId needs to be set');
    if (!streetId) throw new Error('Required streetId needs to be set');

    streetService.adopt(user._id, streetId).then(
      function(result)
      {
        res.status(200).json(result);
      },
      function(error)
      {
        logger.error("streetController.adopt " + error);                          
        res.status(500).json(error);
      }
    )
    .catch(function(error) {
      logger.error("streetController.adopt " + error);                          
      res.status(500).json(error);    
    });
};

exports.leave = function(req, res, next) {
    var user = req.user;
    var streetId = req.params.sid;

    if (!user) throw new Error('Required userId needs to be set');
    if (!streetId) throw new Error('Required streetId needs to be set');

    streetService.leave(user._id, streetId).then(
      function(result)
      {
        res.status(200).json(result);
      },
      function(error) {
        logger.error("streetController.leave " + error);                                  
        res.status(500).json(error);
      }
    )
    .catch(function(error) {
      logger.error("streetController.leave " + error);                                  
      res.status(500).json(error);
    });
};

