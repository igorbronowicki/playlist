$(function(){


/**
 * Создание объекта нашего приложения (namespace).
 */
window.App = {
    Model: {},
    Collection: {},
    View: {},
    Router: {},
    currentMainView: null,
    init: function() {
        //App.monkeyBackboneCleanup();
        App.Router.main = new App.Router.Main();
        Backbone.history.start({pushState: true});
    },
    mainContainer: function() {
        return $("#band-list-wrapper");
    },
    updateMainContainer: function(vi) {
        if ((App.currentMainView !== null) && (typeof App.currentMainView.destroyView !== "undefined")) {
            App.currentMainView.destroyView();
        }
        App.currentMainView = vi; // Тот View который к нам пришел через параметр определяем как текущий
        App.mainContainer().empty().html(App.currentMainView.render().el); // Обновляем {mainContainer}
    },
    monkeyBackboneCleanup: function() {
        // TODO
    }
}


/**
 * Model данных для представления данных о музыкальной группе.
 */
App.Model.Band = Backbone.Model.extend();


/**
 * Collection для хранения списка музыкальных групп.
 */
App.Collection.Bands = Backbone.Collection.extend({
    model: App.Model.Band
});


/**
 * View для отрисовки списка муз. групп.
 */
App.View.BandList = Backbone.View.extend({
    tagName: "ul",

    // При инициализации View навешиваем обытия на переданную ей коллекцию.
    initialize: function() {
        _.bindAll(this, "renderBandItem");
        this.collection.on("add", this.renderBandItem); // Прослушивание добавления в (переданую View) коллекцию элемента.
        this.collection.on("reset", this.render); // Прослушивание события обновления всей коллекции (переданой View).
    },

    render: function() {
        /* Как это писать правильно?
        this.collection.each(function(mo) {
            this.renderBandItem(mo); // Бегаем по всей коллекции и отрисовуем каждый элемент списка отдельно.
        });
        */
        this.collection.each(this.renderBandItem);

        return this;
    },

    renderBandItem: function(mo) {
        var vi = new App.View.BandItem({model: mo}); // Инициализируем View (показа одного элемента в списке муз. групп) передав ей экземпляр модели
        $(this.el).append(vi.render().el); // Добавляем к виртуальному {el} один элемент списка
    },

    destroyView: function() {
        // TODO
    }
});


/**
 * View для отрисовки одного элемента из списка муз. групп (в списке).
 */
App.View.BandItem = Backbone.View.extend({
    tagName: "li",

    // Переменная в которой хранится HTML шаблон элемента списка.
    template: $('#bandListItemTemplate').html(),

    events: {
        "click a": "openBandShow" // При клике на ссылку перейти на стр. полного описания
    },

    initialize: function() {
        this.model.on("change", this.render); // Прослушиваем изменения экземпляра модели
        this.model.on("destroy", this.remove); // Прослушиваем удаление экземпляра модели
    },

    render: function() {
        $(this.el).html(Mustache.render(this.template, this.model.toJSON())); // Заполняем виртуальный {el} отрисованным шаблоном
        $(this.el).attr("data-id", this.model.get("id")); // Добавляем виртуальному {el} атрибут
        return this;
    },

    remove: function() {
        $(this.el).remove();
    },

    openBandShow: function(e) {
        e.preventDefault(); // Т.к. клик происходит по ссылке, необходимо предотвратить действия по умолчанию
        Backbone.history.navigate("band/" + this.model.get("id"), {trigger: true, replace: false}); // Тут надо будет разобраться с опциями
    },

    destroyView: function() {
        // TODO
    }
});


/**
 * View для отрисовки информации о музыкальной группе (полный просмотр).
 */
App.View.BandShow = Backbone.View.extend({
    tagName: "div", // Зачем нам тут div? Почему мы не работаем напрямую с DOM?

    template: $('#bandShowTemplate').html(),

    events: {
        "click a.destroy": "destroyModel" // При клике на ссылку удалить переданный View экземпляр модели и перейти на главную стр. сайта
    },

    initialize: function() {
        this.model.on("change", this.render); // Прослушиваем изменения экземпляра (переданного View) модели
        this.model.on("destroy", this.remove); // Прослушиваем удаление экземпляра (переданного View) модели
    },

    render: function() {
        $(this.el).html(Mustache.render(this.template, this.model.toJSON()));
        return this;
    },

    remove: function() {
        $(this.el).remove();
    },

    destroyModel: function(e) {
        e.preventDefault(); // Т.к. клик происходит по ссылке, необходимо предотвратить действия по умолчанию
        // this.model.trigger("destroy", this.model, this.model.collection, {}); Что это было? + у нас нет сервера
        Backbone.history.navigate("", {trigger: true, replace: false});
    },

    destroyView: function() {
        // TODO
    }
});


/**
 * Router нашего приложения.
 */
App.Router.Main = Backbone.Router.extend({
    routes: {
        "": "index", // Главная страница сайта
        "band/:id": "showBandByID", // Просмотр выбранной муз. группы
        "*a": "index" // Все остальные URL обрабатываются как главная страница сайта
    },
    initialize: function(){
        var initialData = []; // Начальные данные, чтобы не грузить с сервера.
        initialData = [
          {id: 1, name: 'Pendulum', description: 'Pendulum is an Australian/British drum and bass band founded in 2002 in Perth, Western Australia by Rob Swire, Gareth McGrillen, and Paul Harding.'}, 
          {id: 2, name: 'One Republic', description: 'OneRepublic is an American rock band from Colorado Springs, Colorado.'}, 
          {id: 3, name: 'Moby', description: 'Richard Melville Hall (born September 11, 1965), known by his stage name Moby, is an American musician (mostly using guitar), DJ, and photographer.'}, 
          {id: 4, name: 'Daft Punk', description: 'Daft Punk is an electronic music duo consisting of French musicians Guy-Manuel de Homem-Christo (born 8 February 1974) and Thomas Bangalter (born 3 January 1975).'}
        ];

        App.Collection.bands = new App.Collection.Bands(initialData); // Создали экземпляр коллекции, при инициализации заполнили ее.
        App.View.bandList = new App.View.BandList({collection: App.Collection.bands}); // Создали View передав в нее коллекцию.

        this.on("all", this.afterRouting); // А шо это за событие такое мы подвязываем на Router?
    },
    afterRouting: function() {
        // TODO Подсветка текущей выбранной группы в списке
        /*
         $("#playLists dd").removeClass("active")
            switch trigger
              when "route:playList"
                $("#playLists dd[data-id='#{args}']").addClass("active")
        */
    },
    index: function() {
        this._renderMainView();
    },
    showBandByID: function(id) {
        this._renderMainView();
        var a = App.Collection.bands.get(id); // Выбираем из коллекции один элемент по его ID
        var b = new App.View.BandShow({model: a}); // Инициализируем View (показа полного описания муз. группы) передав ей экземпляр модели
        $("#band-view").empty().html(b.render().el); // Очищаем контейнер и записываем туда отрисованный HTML
    },
    _renderMainView: function() {
        if (App.currentMainView === App.View.bandList) {
            return false;
        } else {
            App.updateMainContainer(App.View.bandList);
        }
    }
});


/**
 * Инициализация нашего приложения.
 */
App.init();

});