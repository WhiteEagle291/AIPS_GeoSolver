const BodyModel = require('./BodyModel');
const userModel = require('./UserModel');

class BodyRepository {
  constructor() {}

  async createBody(bodyData) {
    try {
      const body = await BodyModel.create(bodyData);
      return body;
    } catch (error) {
      throw error;
    }
  }

  //update project name, figures list
  async addComment(id, comment) {
    try {

      const filter = {_id: id};
      const update = { $push: { comments: comment } };
      const result = await BodyModel.updateOne(filter, update);

      if(result.modifiedCount === 1)
      {
        return comment;
      }
      else
      {
        console.log("nothing happened...");
      }

    } catch (error) {
      throw error;
    }
  }

  async addWatcher(id,watcher) {
    try {

      const filter = {_id: id};
      const update = { $push: { watchers: watcher } };
      const result = await BodyModel.updateOne(filter, update);

      if(result.modifiedCount === 1)
      {
        return watcher;
      }
      else
      {
        console.log("nothing happened...");
      }

    } catch (error) {
      throw error;
    }
  }

  async removeWatcher(userID,id)
  {
    try {
      const result = await BodyModel.findByIdAndUpdate(
        id,
        { $pull: { watchers: { userID: userID } } }
      );
  
      if (!result) {
        throw new Error('User not found');
      }
  
      return { success: true, message: 'Watcher removed from list' };
    } catch (error) {
      throw error;
    }
  }

  async addFigure(id, figure) {
    try {

      const filter = {_id: id};
      const update = { $push: { figures: figure } };
      await BodyModel.updateOne(filter,{$inc: {length:1}})
      const result = await BodyModel.updateOne(filter, update);
      const duzina = await BodyModel.findById(id);

      if(result.modifiedCount === 1)
      {
        return duzina;
      }
      else
      {
        console.log("nothing happened...");
      }

    } catch (error) {
      throw error;
    }
  }

  async getBodyById(id) {
    try {
      const body = await BodyModel.findById(id);
      return body;
    } catch (error) {
      throw error;
    }
  }

  async getWriteUser(id) {
    try {
      const body = await BodyModel.findById(id);
      return body.watchers[0];
    } catch (error) {
      throw error;
    }
  }

  async getAllBodies() {
    try {
      const bodies = await BodyModel.find();
      return bodies;
    } catch (error) {
      throw error;
    }
  }

  async deleteBody(id) {
    try {
      const result = await BodyModel.findByIdAndDelete(id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}
module.exports = new BodyRepository();