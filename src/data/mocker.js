module.exports = class Mocker {
  constructor(logger) {
    this.data = {};
    this.id = 10;

    this.addRoutes = this.addRoutes.bind(this);
    this.getModels = this.getModels.bind(this);
    this.postModel = this.postModel.bind(this);
    this.putModel = this.putModel.bind(this);
    this.nukeModels = this.nukeModels.bind(this);
  }

  addRoutes(app) {
    app.get('/data/models/:model', this.getModels);
    app.post('/data/models/:model', this.postModel);
    app.put('/data/models/:model', this.putModel);
    app.delete('/data/models/:model', this.nukeModels);
  }

  getModels(req, res) {
    res.send((this.data[req.params.model] || []).filter(v => !v.ack));
  }

  postModel(req, res) {
    const models = this.data[req.params.model] || [];
    const model = req.body;
    const filtered = models.filter(v => v.id === model.id);
    if (filtered && filtered.length > 0) {
      const target = filtered[0];
      const index = models.indexOf(target);
      models.splice(index, 1, model);
    } else {
      model.id = model.id || this.id++;
      models.push(model);
      this.data[req.params.model] = models;
    }

    res.status(200).end();
  }

  putModel(req, res) {
    const models = this.data[req.params.model] || [];
    const model = req.body;
    model.id = this.id++;
    models.push(model);
    this.data[req.params.model] = models;

    res.status(200).end();
  }

  nukeModels(req, res) {
    this.data[req.params.model] = [];

    res.status(200).end();
  }

};
