/**
 * Created by adrianlungu on 08/11/14.
 */

(function () {

    "use strict";

    var tab = document.querySelector('.tab');

    var tabSettings = {

        height: document.querySelector('#tabHeight'),
        fontSize: document.querySelector('#tabFontSize'),
        textColor: document.querySelector('#tabTextColor'),

        backgroundColor: {
            top: document.querySelector('#tabBackgroundTopColor'),
            bottom: document.querySelector('#tabBackgroundBottomColor')
        },

        hoverColor: {
            top: document.querySelector('#tabBackgroundHoverTopColor'),
            bottom: document.querySelector('#tabBackgroundHoverBottomColor')
        },

        highlightColor: document.querySelector('#tabBackgroundHighlightColor'),
        borderColor: document.querySelector('#tabBorderColor')

    };

    var settings = {

        openSide: document.querySelector('#tabOpenSide'),
        backgroundColor: document.querySelector('#backgroundColor'),
        singleInstance: document.querySelector('#singleInstance'),
        autoAdjustWidth: document.querySelector('#autoAdjustWidth'),
        autoMinimize: document.querySelector('#autoMinimize')

    };

    var version = document.querySelector('#version');
    var save = document.querySelector('#save');

    var tabFunctions = {
        mouseEnter: function () {
            tab.style.background = 'linear-gradient(' + tabSettings.hoverColor.top.value + ', '
                + tabSettings.hoverColor.bottom.value + ')';
        },
        mouseLeave: function () {
            tab.style.background = 'linear-gradient(' + tabSettings.backgroundColor.top.value + ', '
                + tabSettings.backgroundColor.bottom.value + ')';
        },
        mouseDown: function () {
            tab.style.background = tabSettings.highlightColor.value;
        }
    };

    function saveOptions() {

        chrome.storage.sync.set({

                tab: JSON.stringify({
                    height: parseInt(tabSettings.height.value),
                    fontSize: parseInt(tabSettings.fontSize.value),
                    textColor: tabSettings.textColor.value,

                    backgroundColor: {
                        top: tabSettings.backgroundColor.top.value,
                        bottom: tabSettings.backgroundColor.bottom.value
                    },

                    hoverColor: {
                        top: tabSettings.hoverColor.top.value,
                        bottom: tabSettings.hoverColor.bottom.value
                    },

                    highlightColor: tabSettings.highlightColor.value,
                    borderColor: tabSettings.borderColor.value
                }),

                optionsSettings: JSON.stringify({
                    openSide: settings.openSide.value,
                    backgroundColor: settings.backgroundColor.value,
                    singleInstance: settings.singleInstance.checked,
                    autoAdjustWidth: settings.autoAdjustWidth.checked,
                    autoMinimize: settings.autoMinimize.checked
                })

            }, function () {
                save.innerHTML = 'Options Saved!';

                setTimeout(function () {
                    save.innerHTML = 'Save';
                }, 1000)
            }
        )
    }

    function getUserDefinedSettings() {

        chrome.storage.sync.get(['tab', 'optionsSettings'], function (items) {

            if (!items.tab) {
                items.tab = {
                    height: 25,
                    fontSize: 11,
                    textColor: '#000000',

                    backgroundColor: {
                        top: '#DBD7D9',
                        bottom: '#C4C3C5'
                    },

                    hoverColor: {
                        top: '#F5F5F5',
                        bottom: '#E6E6E6'
                    },

                    highlightColor: '#F5F5F5',
                    borderColor: '#A9A9A9'
                }
            } else {
                items.tab = JSON.parse(items.tab);
            }

            if (!items.optionsSettings) {
                items.settings = {
                    openSide: 'left',
                    backgroundColor: '#D4D4D4',
                    singleInstance: true,
                    autoAdjustWidth: true,
                    autoMinimize: true
                }
            } else {
                items.settings = JSON.parse(items.optionsSettings);
            }

            tabSettings.height.value = items.tab.height;
            tabSettings.fontSize.value = items.tab.fontSize;
            tabSettings.textColor.value = items.tab.textColor;

            tabSettings.backgroundColor.top.value = items.tab.backgroundColor.top;
            tabSettings.backgroundColor.bottom.value = items.tab.backgroundColor.bottom;

            tabSettings.hoverColor.top.value = items.tab.hoverColor.top;
            tabSettings.hoverColor.bottom.value = items.tab.hoverColor.bottom;

            tabSettings.highlightColor.value = items.tab.highlightColor;
            tabSettings.borderColor.value = items.tab.borderColor;

            settings.openSide.value = items.settings.openSide;
            settings.backgroundColor.value = items.settings.backgroundColor;
            settings.singleInstance.checked = items.settings.singleInstance;
            settings.autoAdjustWidth.checked = items.settings.autoAdjustWidth;
            settings.autoMinimize.checked = items.settings.autoMinimize;

            setTabStyle();

        })

    }

    function setTabStyle() {

        tab.style.color = tabSettings.textColor.value;
        tab.style.background = 'linear-gradient(' + tabSettings.backgroundColor.top.value + ', '
            + tabSettings.backgroundColor.bottom.value + ')';
        tab.style.borderColor = tabSettings.borderColor.value;
        tab.style.height = tabSettings.height.value + 'px';
        tab.style.fontSize = tabSettings.fontSize.value + 'px';

    }

    function init() {

        getUserDefinedSettings();

        version.innerHTML = 'Version ' + chrome.runtime.getManifest().version;

        save.addEventListener("click", saveOptions);

        tabSettings.height.addEventListener("input", setTabStyle);
        tabSettings.fontSize.addEventListener("input", setTabStyle);
        tabSettings.textColor.addEventListener("input", setTabStyle);

        tabSettings.backgroundColor.top.addEventListener("input", setTabStyle);
        tabSettings.backgroundColor.bottom.addEventListener("input", setTabStyle);

        tabSettings.hoverColor.top.addEventListener("input", setTabStyle);
        tabSettings.hoverColor.bottom.addEventListener("input", setTabStyle);

        tabSettings.highlightColor.addEventListener("input", setTabStyle);
        tabSettings.borderColor.addEventListener("input", setTabStyle);

        tab.addEventListener('mouseenter', tabFunctions.mouseEnter);
        tab.addEventListener('mouseleave', tabFunctions.mouseLeave);

        tab.addEventListener('mousedown', tabFunctions.mouseDown);
        tab.addEventListener('mouseup', tabFunctions.mouseEnter);

    }

    init();

})();
