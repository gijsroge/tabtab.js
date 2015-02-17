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

        if ($results.length > 0) {
            return $results;
        } else {
            return $children.closestChild(selector);
        }
    };

    var instance = 0;

    $.fn.tabtab = function(options) {

        /*
         * Plugin default options
         */
        var settings = $.extend({
            tabMenu: '.tabs__menu',             // direct container of the tab menu items
            tabContent: '.tabs__content',       // direct container of the tab content items
            next: '.tabs-controls__next',       // next slide trigger
            prev: '.tabs-controls__prev',       // previous slide trigger

            startSlide: 2,                      // starting slide on pageload
            arrows: true,                       // keyboard arrow navigation
            animateHeight: true,                // if true the height will dynamic and animated.
            fixedHeight: true,                  // if set to true the container will use the heighest height.
            useAnimations: true,                // disables animations.

            easing: [200, 20],                  // http://julian.com/research/velocity/#easing
            speed: 700,                         // animation speed
            slideDelay: 0,                      // delay the animation
            perspective: 1500,                  // set 3D perspective
            transformOrigin: 'center top',      // set the center point of the 3d animation
            perspectiveOrigin: '50% 50%',       // camera angle

            translateY: 0,                      // animate along the Y axis (val: px or ‘slide’)
            translateX: 0,                      // animate along the X axis (val: px or ‘slide’)
            scale: 1.05,                           // animate scale (val: 0-2)
            rotateX: 20,                        // animate rotation (val: 0deg-360deg)
            rotateY: 0,                         // animate Y acces rotation (val: 0deg-360deg)
            skewY: 0,                           // animate Y skew (val: 0deg-360deg)
            skewX: 0,                           // animate X skew (val: 0deg-360deg)

            tabSwitched: function() {}          //callback after a tab has switched
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

            var index = settings.startSlide - 1;
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
            if (settings.animateHeight === true && settings.fixedHeight === false) {


                /*
                 * Animate height
                 */
                maxHeight = contentItem.eq(previousIndex).outerHeight();
                _this.find('.js-tabs-height').height(maxHeight);


            }else if (settings.fixedHeight === true){


                /*
                 * Sets tab content container to the highest height
                 */
                contentItem.each(function() {
                    maxHeight = maxHeight > $(this).outerHeight() ? maxHeight : $(this).outerHeight();
                });
                _this.find('.js-tabs-height').height(maxHeight);


            }else{
                maxHeight = contentItem.eq(previousIndex).outerHeight();
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
                     * Add active class to current tab menu item
                     */
                    menuItem.eq(previousItem).removeClass('active').attr('aria-hidden', 'true');
                    menuItem.eq(selectedItem).addClass('active').attr('aria-hidden', 'false');


                    /*
                     * Add active class to current tab content item
                     */
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
                     * Animate height
                     */
                    if (settings.animateHeight === true && velocity && settings.fixedHeight !== true) {
                        _this.find('.js-tabs-height')
                        .velocity({
                            height: $(contentItem).eq(selectedItem).outerHeight(),
                        }, {
                            easing: settings.easing,
                            duration: settings.speed,
                            queue: false
                        });
                        
                    } else if(settings.animateHeight === false && settings.fixedHeight === false){
                        _this.find('.js-tabs-height').css('height', $(contentItem).eq(selectedItem).outerHeight());
                    }

                    /*
                     * Check if we should disable prev/next controls
                     */
                    checkIfDisabled();

                }
                settings.tabSwitched.call(this);
            };


            /*
             * Prepare elements to be animated
             */
            contentItem.each(function() {
                if (velocity) {
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
                    next.addClass('disabled');
                    prev.removeClass('disabled');
                } else if (index === 0) {
                    prev.addClass('disabled');
                    next.removeClass('disabled');
                } else {
                    next.removeClass('disabled');
                    prev.removeClass('disabled');
                }
            };

            /*
             * Set startslide
             */
            menuItem.attr('aria-hidden', 'true').eq(previousIndex).addClass('active').attr('aria-hidden', 'false');
            contentItem.attr('aria-hidden', 'true').eq(previousIndex).addClass('active').attr('aria-hidden', 'false').css('display', 'block');


            /*
             * Its possible that the startslide is 0
             * so check if we should disable a button
             */
            checkIfDisabled();


        });
    };
}(jQuery));
