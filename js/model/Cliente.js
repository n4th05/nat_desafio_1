class Cliente {
    constructor(obj){
        obj = obj || {}// Isso é um tratamento para evitar undefined quando tentar acessar alguma propriedade.
        this.id = obj.id;
        this.nome = obj.nome;
        this.cpfOuCnpj = obj.cpfOuCnpj;
        this.email = obj.email;
        this.telefone = obj.telefone;
        this.dataCadastro = obj.dataCadastro;
    }

    validar(){
        // return (!this.cpfOuCnpj || !this.email) ? false  : true;  
        return !!(this.cpfOuCnpj && this.email);  
    }
}