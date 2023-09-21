(function () {

    var idSideTabsWindow;
    var idCurrentChromeWindow;
    var isLeftSide = true;
    var width = 365;



    function initSideTabs() {

        chrome.system.display.getInfo({}, displayUnitInfos => {
            // https://developer.chrome.com/docs/extensions/reference/system_display/#method-getInfo
            const info = displayUnitInfos.find(i => i.isPrimary)
            const screen = info.bounds;
            launchPopup(screen)
            // console.log('disdplayinfo', data);
        });

    }
    function launchPopup(screen) {

        if (width < 30 || width > screen.width - 30) {
            width = 365;
        }

        width = Math.min(600, width);

        // nothx
        // chrome.windows.update(idCurrentChromeWindow,
        //     {
        //         'left': isLeftSide ? width : 0,
        //         'width': screen.width - width
        //     }
        // );

        chrome.windows.create({
            'url': chrome.runtime.getURL('app/index.html#?idChromeWindow=' + idCurrentChromeWindow + '&screenWidth=' + screen.width),
            'left': isLeftSide ? 0 : screen.width - width,
            'top': 0,
            'width': width,
            'height': screen.height,
            'type': 'popup'
        }, function (window) {
            idSideTabsWindow = window.id;
        });

    }

    chrome.action.onClicked.addListener(function () {

        chrome.windows.getCurrent({}, function (window) {

            idCurrentChromeWindow = window.id;

            chrome.storage.sync.get(['optionsSettings', 'sideTabsSettings'], function (items) {

                if (!items.optionsSettings) {
                    items.optionsSettings = {
                        openSide: 'left',
                        backgroundColor: '#D4D4D4',
                        singleInstance: true,
                        autoAdjustWidth: true
                    }
                } else {
                    items.optionsSettings = JSON.parse(items.optionsSettings);
                }

                if (!items.sideTabsSettings) {
                    items.sideTabsSettings = {
                        tabWidth: 365,
                        showTabsForSelectedWindow: false,
                        showTabsGroupedPerWindow: false,
                        showPinnedTabs: false
                    }
                } else {
                    items.sideTabsSettings = JSON.parse(items.sideTabsSettings);
                }

                isLeftSide = items.optionsSettings.openSide === 'left';
                width = items.sideTabsSettings.tabWidth;

                if (items.optionsSettings.singleInstance === true) {
                    if (!idSideTabsWindow) {
                        initSideTabs();
                    }
                    else {
                        chrome.windows.get(idSideTabsWindow, function (window) {
                            if (chrome.runtime.lastError) {
                                initSideTabs();
                            } else if (!window) {
                                initSideTabs();
                            }
                            else {
                                chrome.windows.update(idSideTabsWindow, {'focused': true});
                            }
                        })
                    }
                } else {
                    initSideTabs();
                }
            })
        });

    });

})();