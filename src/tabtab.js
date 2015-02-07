(function($) {

    'use strict';

    /*
     * jquery.closestchild 0.1.1
     *
     * Author: Andrey Mikhaylov aka lolmaus
     * Email: lolmaus@gmail.com
     *
     */
    $.fn.closestChild = function(selector) {
        var $children, $results;

        $children = this.children();

        if ($children.length === 0) {
            return $();
        }

        $results = $children.filter(selector);

        if ($results.length > 0){
            return $results;
        }
        else{
            return $children.closestChild(selector);
        }
    };

    var instance = 0;

    $.fn.tabtab = function(options) {

        /*
         * Plugin default options
         */
        var settings = $.extend({
            tabMenu: '.tabs-menu', // direct container of the tab menu items
            tabContent: '.tabs-content', // direct container of the tab content items
            next: '.tabs-controls__next', // next slide trigger
            prev: '.tabs-controls__prev', // previous slide trigger

            startSlide: 1,
            arrows: true, // keyboard arrow navigation
            dynamicHeight: true, // true: animate height changes | false: set container to highest height
            useAnimations: true,

            easing: [0.86, 0, 0.07, 1], // http://easings.net/ replace with values of cubic-bezier
            speed: 600,
            slideDelay: 0,
            perspective: 1200,
            transformOrigin: 'center top',
            perspectiveOrigin: '50% 50%',

            translateY: 0, //normal position = 0
            translateX: 0, //if set to 'slide' the animation will slide the max width of the content
            scale: 0.9, //normal size = 1
            rotateX: 0, //normal rotation = 0
            rotateY: 0, //normal rotation = 0
            skewY: 0, //normal rotation = 0
            skewX: 0, //normal rotation = 0

            tabSwitched: function() {} //callback after a tab has switched
        }, options);



        return this.each(function() {

            /*
             * Plugin vars
             */
            var _this = $(this);
            var menu = _this.closestChild(settings.tabMenu);
            var menuItem = menu.closestChild('li');
            var menuItemCount = menuItem.length;
            var content = _this.closestChild(settings.tabContent);
            var contentItem = content.children();
            var previousIndex;
            var maxHeight;

            //prevent users from entering a startslide that doesn't exist
            if (settings.startSlide < 1) {
                previousIndex = 0;
            } else if (settings.startSlide > menuItemCount) {
                previousIndex = menuItemCount - 1;
            } else {
                previousIndex = settings.startSlide - 1;
            }


            /*
             * Check if X or Y value is set to slide so we can
             * animate it like a default slider
             */
            if (settings.translateX === 'slide') {
                settings.translateX = $(contentItem).outerWidth();
            }

            if (settings.translateY === 'slide') {
                settings.translateY = $(contentItem).outerHeight();
            }

            var index = settings.startSlide;
            var from = 'left';
            var next = _this.find(settings.next);
            var prev = _this.find(settings.prev);
            var velocity = settings.useAnimations;

            //Count the number of instances to disable arrow keys
            instance++;

            /*
             * If velocity.js does not exist
             */
            if (settings.useAnimations) {
                if (!$.isFunction($.fn.velocity)) {
                    velocity = false;
                    console.log('Animations wil not work because you did not include the www.velocityjs.org library');
                }
            }


            /*
             * This is meant as a backup
             * Add position absolute to the slides in your css
             */
            contentItem.css('position', 'absolute');

            /*
             * Set height
             */
            maxHeight = 0;
            content.wrapInner('<div class="js-tabs-height"></div>');
            if (settings.dynamicHeight === true) {


                /*
                 * Dynamic height
                 */
                maxHeight = contentItem.eq(previousIndex).outerHeight();
                _this.find('.js-tabs-height').height(maxHeight);

            } else {


                /*
                 * Sets tab content container to the highest height
                 */
                contentItem.each(function() {
                    maxHeight = maxHeight > $(this).outerHeight() ? maxHeight : $(this).outerHeight();
                });
                _this.find('.js-tabs-height').height(maxHeight);
            }




            /*
             * Get clicked index and activate its content
             */
            menuItem.on('click', function(index) {
                index = $(this).index();


                /*
                 * Call tabswitch to switch tab content
                 */
                if (index !== previousIndex) {
                    tabSwitch(index, previousIndex);
                }


                /*
                 * Set previous index to compare
                 */
                previousIndex = index;

                return false;
            });


            /*
             * Next/Prev controls
             */
            next.on('click', function() {
                index = previousIndex + 1;
                tabSwitch(index, previousIndex);
                return false;
            });

            prev.on('click', function() {
                index = previousIndex - 1;
                tabSwitch(index, previousIndex);
                return false;
            });


            /*
             * Use arrow keys to switch between content
             */
            if (settings.arrows === true && instance <= 1) {
                $(document).keydown(function(e) {

                    if (!$('input').is(':focus')) {
                        if (e.keyCode === 37) {
                            index = previousIndex - 1;
                            tabSwitch(index, previousIndex);

                        } else if (e.keyCode === 39) {
                            index = previousIndex + 1;
                            tabSwitch(index, previousIndex);
                        }
                    }

                });
            }


            /*
             * Switch to selected tab function
             */
            var tabSwitch = function(selectedItem, previousItem) {



                if (selectedItem >= menuItemCount || selectedItem < 0) {
                    if (index < 1) {
                        index = 0;
                    } else if (selectedItem >= menuItemCount) {
                        index = menuItemCount - 1;
                    }
                    return false;
                } else {

                    /*
                     * Check if we should disable prev/next controls
                     */
                    checkIfDisabled();

                    /*
                     * Add active class to current tab menu item
                     */
                    menuItem.eq(previousItem).removeClass('active').attr('aria-hidden', 'true');
                    menuItem.eq(selectedItem).addClass('active').attr('aria-hidden', 'false');


                    /*
                     * Add active class to current tab content item
                     */
                    console.log('aria-hidden');

                    contentItem.eq(previousItem).removeClass('active').attr('aria-hidden', 'true');
                    contentItem.eq(selectedItem).addClass('active').attr('aria-hidden', 'false');

                    if (selectedItem > previousItem) {

                        from = 'right';

                        /*
                         * Store current index so we can compare on next click
                         */
                        previousIndex = index;
                        index = selectedItem;

                    } else if (selectedItem < previousItem) {

                        from = 'left';

                        /*
                         * Store current index so we can compare on next click
                         */
                        previousIndex = index;
                        index = selectedItem;

                    }



                    /*
                     * START DELETE
                     */
                    if (velocity) {
                        /*
                         * Animate elements in view
                         */
                        contentItem.eq(selectedItem)
                            .velocity({
                                translateX: function() {
                                    if (from === 'left') {
                                        return -settings.translateX;
                                    } else {
                                        return settings.translateX;
                                    }
                                },
                                translateY: function() {
                                    if (from === 'left') {
                                        return -settings.translateY;
                                    } else {
                                        return settings.translateY;
                                    }
                                },
                                scale: function() {
                                    if (from === 'left') {
                                        return settings.scale - (settings.scale - 1) * 2;
                                    } else {
                                        return settings.scale + (settings.scale - 1);
                                    }
                                },
                                rotateX: function() {
                                    if (from === 'left') {
                                        return -settings.rotateX;
                                    } else {
                                        return settings.rotateX;
                                    }
                                },
                                rotateY: function() {
                                    if (from === 'left') {
                                        return -settings.rotateY;
                                    } else {
                                        return settings.rotateY;
                                    }
                                },
                                skewY: function() {
                                    if (from === 'left') {
                                        return -settings.skewY;
                                    } else {
                                        return settings.skewY;
                                    }
                                },
                                skewX: function() {
                                    if (from === 'left') {
                                        return -settings.skewX;
                                    } else {
                                        return settings.skewX;
                                    }
                                },
                                opacity: 0
                            }, {
                                duration: 0
                            })
                            .velocity({
                                translateX: 0,
                                translateY: 0,
                                scale: 1,
                                opacity: 1,
                                rotateY: 0,
                                rotateX: 0,
                                skewY: 0,
                                skewX: 0
                            }, {
                                easing: settings.easing,
                                duration: settings.speed,
                                delay: settings.slideDelay,
                                queue: false,
                                complete: function() {
                                    $(this).css('z-index', menuItemCount);
                                }
                            });


                        /*
                         * Animate elements out of view
                         */
                        contentItem.eq(previousItem)
                            .velocity({
                                translateX: function() {
                                    if (from === 'left') {
                                        return settings.translateX;
                                    } else {
                                        return -settings.translateX;
                                    }
                                },
                                translateY: function() {
                                    if (from === 'left') {
                                        return settings.translateY;
                                    } else {
                                        return -settings.translateY;
                                    }
                                },
                                scale: function() {
                                    if (from === 'left') {
                                        return settings.scale + (settings.scale - 1);
                                    } else {
                                        return settings.scale - (settings.scale - 1) * 2;
                                    }
                                },
                                rotateX: function() {
                                    if (from === 'left') {
                                        return settings.rotateX;
                                    } else {
                                        return -settings.rotateX;
                                    }
                                },
                                rotateY: function() {
                                    if (from === 'left') {
                                        return settings.rotateY;
                                    } else {
                                        return -settings.rotateY;
                                    }
                                },
                                rotateZ: function() {
                                    if (from === 'left') {
                                        return settings.rotateZ;
                                    } else {
                                        return -settings.rotateZ;
                                    }
                                },
                                skewX: function() {
                                    if (from === 'left') {
                                        return settings.skewX;
                                    } else {
                                        return -settings.skewX;
                                    }
                                },
                                skewY: function() {
                                    if (from === 'left') {
                                        return settings.skewY;
                                    } else {
                                        return -settings.skewY;
                                    }
                                },
                                opacity: 0,
                                delay: 1000
                            }, {
                                easing: settings.easing,
                                duration: settings.speed,
                                queue: false,
                                complete: function() {
                                    $(this).css('z-index', '-1');
                                }
                            });



                    } else {
                        contentItem.eq(previousItem).hide();
                        contentItem.eq(selectedItem).show();
                    }
                    /*
                     * END DELETE
                     */


                    /*
                     * Animate height
                     */
                    if (settings.dynamicHeight === true) {
                        if (velocity) {
                            /*
                             * START DELETE
                             */
                            _this.find('.js-tabs-height')
                                .velocity({
                                    height: $(contentItem).eq(selectedItem).outerHeight(),
                                }, {
                                    easing: settings.easing,
                                    duration: settings.speed,
                                    queue: false
                                });
                            /*
                             * END DELETE
                             */
                        } else {
                            _this.find('.js-tabs-height').css('height', $(contentItem).eq(selectedItem).outerHeight());
                        }
                    }
                }
                settings.tabSwitched.call(this);

            };


            /*
             * Prepare elements to be animated
             */
            contentItem.each(function() {
                if (velocity) {
                    /*
                     * START DELETE
                     */
                    if ($(this).index() !== previousIndex) {
                        $(this)
                            .velocity({
                                opacity: 0
                            }, {
                                display: 'block',
                                duration: 0,
                                complete: function() {
                                    $(this).css({
                                        'z-index': '-1'
                                    });
                                }
                            });
                    } else {
                        $(this).css({
                            'opacity': '1',
                            'z-index': menuItemCount
                        });
                    }
                    /*
                     * END DELETE
                     */
                } else {
                    $(this).hide();
                }
            });


            /*
             * Set tabs menu above slides
             */
            menu.css({
                'z-index': menuItemCount + 1,
                'position': 'relative'
            });


            /*
             * Set perspective to tabcontent container
             */
            if (settings.useAnimations) {
                $('.js-tabs-height').css({
                    'perspective': settings.perspective,
                    'perspective-origin': settings.perspectiveOrigin
                });
                contentItem.css({
                    'transform-origin': settings.transformOrigin
                });
            }


            var checkIfDisabled = function() {
                if (index === menuItemCount - 1) {
                    next.addClass('disabled').attr('disabled', 'disabled');
                } else if (index === 0) {
                    prev.addClass('disabled').attr('disabled', 'disabled');
                } else {
                    next.removeClass('disabled').removeAttr('disabled');
                    prev.removeClass('disabled').removeAttr('disabled');
                }
            };

            /*
             * Set startslide
             */
            menuItem.attr('aria-hidden', 'true').eq(previousIndex).addClass('active').attr('aria-hidden', 'false');
            contentItem.attr('aria-hidden', 'true').eq(previousIndex).addClass('active').attr('aria-hidden', 'false').css('display', 'block');


            /*
             * Its possible that the startslide is 0
             * so check if we should disalbe previous button
             */
            checkIfDisabled();



        });

    };

}(jQuery));
