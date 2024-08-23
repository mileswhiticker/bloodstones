/*
 * ------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * bloodstones implementation : © Miles Whiticker <miles.whiticker@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 */
 
define(
	[
		"dojo/_base/declare",
		"dojo/_base/fx",
		"dojo/_base/lang",
		"dojo/on",
		"dojo/dom-class",
		"dojo/dom-attr",
		"ebg/zone"
	],
	function (declare, dojofx, domClass, domAttr, lang, on, zone){
		
		//put your static variables here
		//
		
		var singleton = declare("modules.ArmyZone", ebg.zone, {
			constructor: function(){
				this.default_slide_duration = 500;
			},
			
			// Place a node identified by its id in this zone.
			// the node is slided to its location.
			// note: weight is optional and can be null
			// Miles: I've made this override because of line 37, the BGA function attachToNewParent() will clone the object and destroy the original (which is bad)
			// see https://en.doc.boardgamearena.com/BGA_Studio_Cookbook and https://en.doc.boardgamearena.com/Game_interface_logic:_yourgamename.js
			placeInZone: function( id, weight )
			{
				//console.log( "placeInZone: "+id );

				if( typeof weight == 'undefined' )
				{   weight = 0; }
				
				if( this.isInZone( id) )
				{   return ;    }   // Already in zone

				this.items.push( {id:id, weight:weight} );
				
				this.attachToNewParentNoDestroy( $( id ), this.container_div );
				
				var sort_function = function(a,b) { 
										if( a.weight>b.weight ) {   return 1;   }
										else if( a.weight<b.weight ) {   return -1;   }
										else { return 0; }
									 };
				this.items.sort( sort_function );
				
				this.updateDisplay();        
			},
			
			attachToNewParentNoDestroy: function (mobile_in, new_parent_in, relation, place_position) {
				const mobile = $(mobile_in);
				const new_parent = $(new_parent_in);

				var src = dojo.position(mobile);
				if (place_position)
				{
					mobile.style.position = place_position;
				}
				dojo.place(mobile, new_parent, relation);
				mobile.offsetTop;//force re-flow
				var tgt = dojo.position(mobile);
				var box = dojo.marginBox(mobile);
				var cbox = dojo.contentBox(mobile);
				var left = box.l + src.x - tgt.x;
				var top = box.t + src.y - tgt.y;

				mobile.style.position = "absolute";
				mobile.style.left = left + "px";
				mobile.style.top = top + "px";
				box.l += box.w - cbox.w;
				box.t += box.h - cbox.h;
				mobile.offsetTop;//force re-flow
				return box;
			},
			
			//override this function for nicer layouting when there is <=4  items
			itemIdToCoordsEllipticalFit: function( i, control_width, control_height, items_nbr )
			{
				var ellipse_center_x = control_width / 2;            
				var ellipse_center_y = control_height / 2;
				var pi = 3.1415927;
				
				var res = {};
				res.w = this.item_width;
				res.h = this.item_height;
				
				// Start from last
				var j = items_nbr - (i + 1);
				
				// Around and around ; i starts at 0
				var item_margin = 0;//this.army_selection_border_width
				if (items_nbr <= 1) {
					res.x = ellipse_center_x - this.item_width/2 - item_margin;
					res.y = ellipse_center_y - this.item_height/2 - item_margin;
				} else if (items_nbr == 2) {
					if(control_width > control_height)
					{
						//horizontal alignment
						res.x = ellipse_center_x - this.item_width/2 - item_margin - (this.item_width+item_margin)/2 + j * (this.item_width+item_margin);
						res.y = ellipse_center_y - this.item_height/2 - item_margin;
					}
					else
					{
						//vertical alignment
						res.x = ellipse_center_x - this.item_width/2 - item_margin;
						res.y = ellipse_center_y - this.item_height/2 - item_margin - (this.item_height+item_margin)/2 + j * (this.item_height+item_margin);
					}
				} else if (items_nbr == 3) {
					if(control_width > control_height)
					{
						//horizontal alignment
						res.x = ellipse_center_x - this.item_width/2 - item_margin - 2*(this.item_width+item_margin)/2 + j * (this.item_width+item_margin);
						res.y = ellipse_center_y - this.item_height/2 - item_margin;
					}
					else
					{
						//vertical alignment
						res.x = ellipse_center_x - this.item_width/2 - item_margin;
						res.y = ellipse_center_y - this.item_height/2 - item_margin - 2*(this.item_height+item_margin)/2 + j * (this.item_height+item_margin);
					}
				} else if (items_nbr == 4) {
					if(control_width > control_height)
					{
						var ellipse_radius_x = res.w;
						var ellipse_radius_y = res.h * ellipse_center_y / ellipse_center_x;
						var angle = pi/4 + j * (2 * pi / 4);
						res.x = ellipse_center_x + ellipse_radius_x * Math.cos(angle) - (res.w+item_margin) / 2;
						res.y = ellipse_center_y + ellipse_radius_y * Math.sin(angle) - (res.h+item_margin) / 2;
					}
					else
					{
						//vertical alignment
						res.x = ellipse_center_x - this.item_width/2 - 24;
						res.y = ellipse_center_y - this.item_height/2 - 24 - 3*(this.item_height+item_margin)/2 + j * (this.item_height+item_margin);
					}
				} else if (j <= 4) {
					var ellipse_radius_x = res.w;
					var ellipse_radius_y = res.h * ellipse_center_y / ellipse_center_x;
					var angle = pi + j * (2 * pi / 5);
					res.x = ellipse_center_x + ellipse_radius_x * Math.cos(angle) - res.w / 2;
					res.y = ellipse_center_y + ellipse_radius_y * Math.sin(angle) - res.h / 2;
				} else if (j > 4) {
					var ellipse_radius_x = res.w * 2;
					var ellipse_radius_y = res.h * 2 * ellipse_center_y / ellipse_center_x;
					var angle = pi - pi / 2 + (j-4) * (2 * pi / Math.max(10, items_nbr - 5));
					res.x = ellipse_center_x + ellipse_radius_x * Math.cos(angle) - res.w / 2;
					res.y = ellipse_center_y + ellipse_radius_y * Math.sin(angle) - res.h / 2;
				}
				
				return res;
			},
			
			// Update the display completely
			updateDisplay: function( )
			{
				//console.log( "zone::updateDisplay ("+this.container_div.id+")" );
				var controlCoords = dojo.position( this.container_div );

			  //  console.log( controlCoords );
				
				var control_width = controlCoords.w;
				if( this.autowidth )
				{
					var parentControlCoords = dojo.position( $('page-content') );
					control_width = parentControlCoords.w;
			   //     console.log( "autowidth with width="+control_width );
				}

				var control_new_width = 0;
				var control_new_height = 0;
				var item_index = 0;
			
				for( var i in this.items )
				{
					var item = this.items[ i ];
					var item_id = item.id;
					var item_div = $( item_id );
					
					if( item_div )  // Filter node that does not exist
					{     
						//console.log( "item: "+item_id+" (index:"+item_index+")" );
						var coords = this.itemIdToCoords( item_index, control_width, controlCoords.h, this.items.length );
						item_index ++;
							   
						control_new_width = Math.max( control_new_width, coords.x + coords.w );
						control_new_height = Math.max( control_new_height, coords.y + coords.h );
		 
						//console.log( "moving item to "+currentLeft+","+currentTop );
						
						// Item already exists => move it to its new location
						// Note: this position should be relative to current control location.
						var duration = this.default_slide_duration;
						if( this.page.instantaneousMode || this.instantaneous )
						{   
							//duration= 2;
							dojo.style(item_div,"top",coords.y + "px");
							dojo.style(item_div,"left",coords.x + "px");
						}
						else
						{
							//default easing is linear, but xInOut will start slow, get faster, then slow again
							//some options are quadInOut, cubicInOut, quartInOut, quintInOut
							//console.log("anim sliding...");
							var anim = dojo.fx.slideTo( {  node: item_div,
												top: coords.y,
												left: coords.x,
												duration: duration,
												unit: "px"} );
							anim.easing = dojo.fx.easing.cubicInOut;
							//anim = this.page.transformSlideAnimTo3d( anim, item_div, duration, null );
							anim.play();
						}
					}    
					
				}
				
				if( this.autoheight )
				{
					dojo.style( this.container_div, 'height', control_new_height+'px' );
				}
				
				if( this.autowidth )
				{
					dojo.style( this.container_div, 'width', control_new_width+'px' );
				}
			},
			
			// Element is remove from zone
			// id = id of the item (string)
			// if "bDestroy = true", element is destroyed (after fadeout)
			// if 'to' is specified (type = node): slide element to this place before destruction (and is detroyed if bDestroy = true)
			removeFromZone: function( id, bDestroy, to )
			{
				var destroyElementFromStock = function ( node ) { dojo.destroy( node ); };
				for( var i in this.items )
				{
					var item = this.items[ i ];
					if( item.id == id )
					{
						var anim = null;
						if( to )
						{
							var duration = this.default_slide_duration;
							if( this.instantaneous )
							{   
								duration= 1;
							}
							anim = this.page.slideToObject( $( item.id ), to, duration).play();  
							if( bDestroy === true )  
							{   dojo.connect( anim, 'onEnd', destroyElementFromStock ); }
							anim.play();
						}
						else
						{
							if( bDestroy === true )
							{
								var duration = this.default_slide_duration;
								if( this.page.instantaneousMode || this.instantaneous )
								{   
									duration= 1;
								}

								anim = dojo.fadeOut( { node:  $( item.id ), duration: duration,
											onEnd: destroyElementFromStock
										  } );
								anim.play();                                     
							}
						}
						this.items.splice( i, 1 );
						this.updateDisplay();
						return;
					}   
				}
			
			},
			
		})
	}
);