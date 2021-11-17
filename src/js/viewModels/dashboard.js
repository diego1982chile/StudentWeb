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
define(['knockout', "ojs/ojdataprovider", 'ojs/ojtable', 'ojs/ojpagingcontrol', 'ojs/ojmodel', 'ojs/ojpagingtabledatasource', 
        'ojs/ojarraytabledatasource', 'ojs/ojcollectiontabledatasource'],
 function(ko, ojdataprovider) {
     
    function DashboardViewModel() {
      // Below are a set of the ViewModel methods invoked by the oj-module component.
      // Please reference the oj-module jsDoc for additional information.

        var self = this;

        self.studentData = ko.observable();
        self.pagingDatasource = ko.observable(new oj.PagingTableDataSource(new oj.ArrayTableDataSource([])));
        
        
        self.filter = ko.observable("");        

        self.parseStudentResponse = function(response) {
            
            return {
                'id': response.id,
                'rut': response.rut,
                'name': response.name,
                'birth': response.birth,
                'genre': response.genre,                
            };
        };

        self.rootResponseParser = function(response) {
            return response.items;
        };

        self.studentColumns = [
            { headerText: 'Rut', field: 'rut' },
            { headerText: 'Name', field: 'name' },
            { headerText: 'Birth', field: 'birth' },
            { headerText: 'Gender', field: 'gender' }            
        ];

        self.getStudentModel = function() {
            
            const StudentModel = oj.Model.extend({
                //parse: self.parseStudentResponse,
                idAttribute: 'id'
            });
            return new StudentModel();
        };

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
            
            returnCollection.customURL = function(operation, collection, options) {
                console.log(options);                                
                
                const page = options.startIndex > 0 ? (options.startIndex / options.fetchSize) : 0;                
                const requestBody = { page: page, fetchSize: options.fetchSize };
                
                if(options.sort) {
                    requestBody.sort = options.sort;
                    requestBody.sortDir = options.sortDir;
                }
                
                if (self.filter() && self.filter() !== "") {
                    requestBody.filter = self.filter();
                }
                
                return {
                    url: 'http://localhost:8080/api/students',
                    type: 'POST',
                    contentType: 'application/json',
                    /*
                    beforeSend: function(xhr) {
                        xhr.setRequestHeader('Authorization', 'Basic UFNDX1NVUEVSVVNFUjpXZWxjb21lMQ==');
                    },
                    */
                    data: JSON.stringify(requestBody)
                };
            };
            return returnCollection;
        }
        
        self.pagingDatasource = ko.computed(function () {
            //alert("buildCollection");           
            self.studentData(self.getStudentCollection());
            return new oj.PagingTableDataSource(new oj.CollectionTableDataSource(self.studentData()));                                       
        });                                
        
        self.handleValueChanged = () => {            
            self.filter(document.getElementById("filter").rawValue);                                          
            self.studentData().refresh();                                    
        };        
        
    }

    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return DashboardViewModel;
  }
);
