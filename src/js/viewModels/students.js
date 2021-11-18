/**
 * @license
 * Copyright (c) 2014, 2021, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(['knockout', "ojs/ojconverter-datetime", "ojs/ojconverterutils-i18n", 
        "ojs/ojdataprovider", 'ojs/ojtable', 'ojs/ojpagingcontrol', 
        'ojs/ojmodel', 'ojs/ojpagingtabledatasource', 
        'ojs/ojarraytabledatasource', 'ojs/ojcollectiontabledatasource',
        'ojs/ojvalidation-datetime'],
    
 function(ko) {
     
    function StudentsViewModel() {
      // Below are a set of the ViewModel methods invoked by the oj-module component.
      // Please reference the oj-module jsDoc for additional information.        

        var self = this;
        
        //Se utiliza common model para definir el modelo 
        //y se especifica una url custom para el llamado a la API
        
        self.studentData = ko.observable();
        self.pagingDatasource = ko.observable(new oj.PagingTableDataSource(new oj.ArrayTableDataSource([])));
                
        self.filter = ko.observable("");        

        //Definición columnas tabla de alumnos
        self.studentColumns = [
            { headerText: 'Rut', field: 'rut' },
            { headerText: 'Name', field: 'name' },
            { headerText: 'Birth', field: 'birth' },
            { headerText: 'Gender', field: 'gender' }            
        ];

        //Definición del modelo (single row)
        self.getStudentModel = function() {
            
            const StudentModel = oj.Model.extend({
                parse: self.parseStudentResponse,
                idAttribute: 'id'
            });
            
            return new StudentModel();
        };
        
        self.parseStudentResponse = function(response) {
            
            return {
                'id': response.id,
                'rut': response.rut,
                'name': response.name,
                'birth': self.getStringFromDate(response.birth, 'dd-MMM-yyyy'),
                'gender': response.gender,                
            };
        };

        //Definición de la colección (multiples rows)
        self.getStudentCollection = function() {                        
            
            const StudentCollection = oj.Collection.extend({
                fetchSize: 5,
                model: self.getStudentModel(),
                parse: self.rootResponseParser
            });
            
            const returnCollection = new StudentCollection();
            
            returnCollection.customPagingOptions = function(response) {
                return {
                    totalResults: response.totalResults,
                    limit: response.limit
                };
            };
            
            // Se especifica url custom para capturar los parámetros que se 
            // incluirán en el objeto pageRequest
            returnCollection.customURL = function(operation, collection, options) {                                               
                
                // Obtener especificaciones de búsqueda para armar objeto pageRequest
                const page = options.startIndex > 0 ? (options.startIndex / options.fetchSize) : 0;                
                
                const myPageRequest = { page: page, fetchSize: options.fetchSize };
                
                if(options.sort) {
                    myPageRequest.sort = options.sort;
                    myPageRequest.sortDir = options.sortDir;
                }
                
                // La cadena de búsqueda no viene en options, se rescata 
                // directamente desde el observable asociado al filtro
                if (self.filter() && self.filter() !== "") {
                    myPageRequest.filter = self.filter();
                }
                
                return {
                    url: ko.dataFor(document.getElementById('globalBody')).contextPath + '/students',
                    type: 'POST',
                    contentType: 'application/json',
                    /*
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('Authorization', 'Basic UFNDX1NVUEVSVVNFUjpXZWxjb21lMQ==');
                    },
                    */
                    data: JSON.stringify(myPageRequest)
                };
            };
            return returnCollection;
        }
        
        self.rootResponseParser = function(response) {
            return response.items;
        };
        
        // Actualiza el datasource ante cualquier evento, ie: paginación, ordenamiento (excepto filtro)
        self.pagingDatasource = ko.computed(function () {
            //alert("buildCollection");           
            self.studentData(self.getStudentCollection());
            return new oj.PagingTableDataSource(new oj.CollectionTableDataSource(self.studentData()));                                       
        });                                
        
        // Listener para el evento filtrar
        self.handleValueChanged = () => {            
            // Se actualiza el valor del filtro
            self.filter(document.getElementById("filter").rawValue);                                          
            // Se realiza un refresh de la colección para disparar llamado a API
            self.studentData().refresh();                                    
        };   
        
        // Funciones para el formato de fechas
        self.getConverter = function(pattern) {
            return oj.Validation.converterFactory(oj.ConverterFactory.CONVERTER_TYPE_DATETIME).createConverter({
                pattern
            });
        }
        
        // Funciones para el formato de fechas
        self.getStringFromDate = function(date, format) {
            const converter = self.getConverter(format);
            const newDate = new Date(date);
            return converter.format(oj.IntlConverterUtils.dateToLocalIso(newDate));
        };
        
    }

    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return StudentsViewModel;
  }
);
