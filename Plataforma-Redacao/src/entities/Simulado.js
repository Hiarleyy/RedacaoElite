const { v4: uuid } = require("uuid");

class Simulado {
    constructor(simulado) {
        this.id = uuid();
        this.turmaId = simulado.turmaId;
        this.titulo = simulado.titulo
    }
}

module.exports = Simulado