
define(
	[
		"dojo",
		"dojo/_base/declare"
	],
	function (dojo, declare){
		
		var instance = declare("_province_select", null, {
			//put your functions here
			
			HandleDefaultProvinceClicked : function(province_name)
			{
				if(this.GetSelectedProvinceName() == province_name)
				{
					this.UnselectProvince();
				}
				else
				{
					this.ForceSelectProvince(province_name);
				}
			},
			
			SelectProvince : function(province_name)
			{
				//console.log("page::SelectProvince(" + province_name + ")");
				//console.log(this.other_units_display_stack);
				if(this.IsAnyProvinceSelected())
				{
					console.log("WARNING! page::SelectProvince(" + province_name + ") but already selected: " + this.selected_province_name);
					return;
				}
				
				//console.log("page::SelectProvince(" + province_name + ")");
				this.selected_province_name = province_name;
				this.selected_province_main_army = this.GetMainPlayerArmyInProvinceOrNull(province_name, this.player_id);
				this.SetUIProvinceSelection(province_name);
				
				//setup the "other units" panel
				
				var other_stacks = this.GetOtherUnitStacksInProvince(province_name, this.player_id);
				//console.log("found other stacks:");
				//console.log(other_stacks);
				for(var i in other_stacks)
				{
					var army_stack = other_stacks[i];
					//console.log("putting in other units display:");
					//console.log(army_stack);
					this.other_units_display_stack.copyAcrossParentTiles(army_stack);
				}
				
				//setup this callback function
				if(this.on_select_map_overlay_callback != null)
				{
					this.on_select_map_overlay_callback(province_name);
				}
				else
				{
					console.log("WARNING! page::SelectProvince(" + province_name + ") but this.on_select_map_overlay_callback is null");
				}
			},
			
			TryUnselectProvince : function(ui_update = true)
			{
				console.log("this function is deprecated, stop using it!");
				this.UnselectProvince(ui_update, true);
			},
			
			UnselectProvince : function(ui_update = true, silent = false)
			{
				if(!this.IsAnyProvinceSelected())
				{
					if(!silent)
					{
						console.log("WARNING! page::UnselectProvince(" + ui_update + ") but province selected is null");
					}
					return;
				}
				console.log("page::UnselectProvince()");
				
				this.UnsetUIProvinceSelection();
				
				//there are redundant calls here but at least it's functional
				//if(ui_update)
				{
					this.SetUIProvinceSelectionEmpty();
				}
				
				this.selected_province_name = null;
				this.selected_province_main_army = null;
				
				if(this.on_unselect_map_overlay_callback != null)
				{
					this.on_unselect_map_overlay_callback();
				}
				else
				{
					console.log("WARNING! page::UnselectProvince() but this.on_unselect_map_overlay_callback is null");
				}
			},
			
			ForceSelectProvince : function(new_province_name)
			{
				//console.log("page::ForceSelectProvince(" + new_province_name + ")");
				var old_province_name = this.GetSelectedProvinceName();
				if(old_province_name != null)
				{
					this.UnselectProvince(false);
				}
				this.SelectProvince(new_province_name);
			},
			
			RefreshProvinceSelection : function()
			{
				//console.log("page::RefreshProvinceSelection()");
				var old_province_name = this.GetSelectedProvinceName();
				if(old_province_name != null)
				{
					this.UnselectProvince(true);
					this.SelectProvince(old_province_name);
				}
			},
			
			IsAnyProvinceSelected : function()
			{
				return this.selected_province_name != null;
			},
			
			GetSelectedProvinceName : function()
			{
				return this.selected_province_name;
			},
			
		});
		
		return instance;
	}
);
