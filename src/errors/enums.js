export const ENUM_ERRORS = {
    ROUTING_ERROR: 100,                   // 
    INVALID_TYPES_ERROR: 200,             // TYPE INVALID (ex: TYPE string and input int)
    THIS_OBJECT_ALREDY_EXISTS: 300,       // BBDD TYPE UNIQUE
    FOREING_KEY_OBJECT_NOT_EXISTS: 400,   // Ese objecto seleccionado no existe en el la otra tabla
    INVALID_TYPE_EMPTY: 500,              // 
    INVALID_OBJECT_NOT_EXISTS: 600,       //
    DATABASE_ERROR: 700                   // Error BBDD
}