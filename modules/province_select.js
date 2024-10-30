
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
				if(this.IsAnyProvinceSelected())
				{
					console.log("WARNING! page::SelectProvince(" + province_name + ") but already selected: " + this.selected_province_name);
					return;
				}
				
				//console.log("page::SelectProvince(" + province_name + ")");
				this.selected_province_name = province_name;
				this.selected_province_main_army = this.GetMainPlayerArmyInProvinceOrNull(province_name, this.player_id);
				this.SetUIProvinceSelection(province_name);
				
				if(this.on_select_map_overlay_callback != null)
				{
					this.on_select_map_overlay_callback();
				}
				else
				{
					console.log("WARNING! page::SelectProvince(" + province_name + ") but this.on_select_map_overlay_callback is null");
				}
			},
			
			UnselectProvince : function(ui_update = true)
			{
				if(!this.IsAnyProvinceSelected())
				{
					console.log("WARNING! page::SelectProvince(" + province_name + ") but province selected is null");
					return;
				}
				//console.log("page::UnselectProvince()");
				
				this.UnsetUIProvinceSelection();
				
				if(ui_update)
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
