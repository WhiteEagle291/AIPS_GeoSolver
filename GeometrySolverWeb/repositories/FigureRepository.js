const FigureModel = require('./figure'); 

class FigureRepository {
  constructor() {}

  async create(figureData) {
    try {
      const figure = await FigureModel.create(figureData);
      return figure;
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const figure = await FigureModel.findById(id);
      return figure;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const figures = await FigureModel.find();
      return figures;
    } catch (error) {
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const figure = await FigureModel.findByIdAndUpdate(id, updateData, {
        new: true,
      });
      return figure;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await FigureModel.findByIdAndDelete(id);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new FigureRepository();
