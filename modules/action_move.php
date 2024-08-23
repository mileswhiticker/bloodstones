<?php

trait action_move
{
	function HandleMoveAction($action_info, $paid_tile_infos, $paid_tile_ids)
	{
		$outcome_info = ["failure_reason" => self::ACTION_FAIL_UNKNOWN];
		$current_player_id = $this->getCurrentPlayerId();
		$current_player_name = $this->getCurrentPlayerName();
		
		//note: this includes army splits as well as moves
		//first, check if the player's move is legal
		self::notifyAllPlayers("debug", "", array('debugmessage' => "server::HandleMoveAction()"));
		self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($action_info, true)));
		
		if($this->getStateName() != "playerMain")
		{
			$outcome_info = ["failure_reason" => self::ACTION_FAIL_STATE];
			return $outcome_info;
		}
		
		//loop over every step to check legality
		foreach($action_info as $army_id_string => $army_action_steps)
		{
			//todo
			break;
		}
		
		//assume that the moves are legal for now
		$success = true;
		
		//army split actions use a temp army id for all following client side steps, we need to record that because this algorithm immediately assigns full ids for any detected temp ids
		$temp_id_map = [];
		if($success)
		{
			foreach($action_info as $army_id_string => $army_action_steps)
			{
				$source_army_id = self::GetArmyIdNumFromString($army_id_string);
				if($this->isArmyIdTemp($source_army_id))
				{
					$temp_id = $source_army_id;
					if(key_exists($source_army_id, $temp_id_map))
					{
						$source_army_id = $temp_id_map[$source_army_id];
						self::notifyAllPlayers("debug", "", array('debugmessage' => "server::HandleMoveAction() successfully replaced temp army id: $temp_id with assigned army id: $source_army_id"));
					}
					else
					{
						self::notifyAllPlayers("debug", "", array('debugmessage' => "ERROR: server::HandleMoveAction() step with army temp_id:$temp_id could not find matching assigned army id, skipping this army"));
						continue;
					}
				}
				$source_army = self::getObjectFromDB("SELECT army_id, province_id, player_id FROM armies WHERE army_id=$source_army_id");
				//$num_steps = count($army_action_steps);
				self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($army_action_steps,true)));
				
				$dest_province_name = "NA";
				//self::notifyAllPlayers("debug", "", array('debugmessage' => "$myvar"));
				foreach($army_action_steps as $action_step)
				{
					$action_step_type = $action_step["step_type"];
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "action_step_type: $action_step_type"));
					
					$action_step_prov_name = $action_step["prov_name"];
					//self::notifyAllPlayers("debug", "", array('debugmessage' => "action_step_prov_name: $action_step_prov_name"));
					
					if($action_step_type == self::ACTION_MOVE)
					{
						//self::notifyAllPlayers("debug", "", array('debugmessage' => "self::ACTION_MOVE,source_army_id:$source_army_id,action_step_prov_name:$action_step_prov_name"));
						/*
						var action_step = {step_type: ACTION_MOVE, prov_name: target_province_info.name};
						var army_action_steps = this.queued_action_steps[moving_army.id_string];
						army_action_steps.push(action_step);
						*/
						//self::notifyAllPlayers("debug", "", array('debugmessage' => "self::ACTION_MOVE action_step_prov_name:$action_step_prov_name"));
						$dest_province_name = $action_step["prov_name"];
					}
					else if($action_step_type == self::ACTION_SPLIT)
					{
						//if this is a split action, then $source_army will be null because $source_army_id is a temp id for the new temp army
						
						//this is the javascript that is passed in via json
						/*
						var split_step = {step_type: ACTION_SPLIT, prov_name: source_army.province_id, prov_id: split_prov_id, tile_id: cur_tile_id, temp_army_id_num: temp_army.id_num};
						*/
						
						$new_army = self::tryArmyStackTransfer($source_army_id, null, array($action_step["tile_id"]), self::SELECT_ARMY_NONE, $action_step_prov_name, $action_step["temp_army_id_num"]);
						$army_id_assigned = $new_army["id_num"];
						$army_id_temp = $action_step["temp_army_id_num"];
						$temp_id_map[$army_id_temp] = $army_id_assigned;
						
						self::notifyAllPlayers("debug", "", array('debugmessage' => "server::HandleMoveAction() successfully assigned temp army id: $army_id_temp with assigned army id: $army_id_assigned"));
						self::notifyAllPlayers("debug", "", array('debugmessage' => var_export($temp_id_map,true)));
					}
					else
					{
						self::notifyAllPlayers("debug", "", array('debugmessage' => "WARNING: unknown action_step_type in tryPayAction(): $action_step_type"));
					}
				}
				
				//the functionality here was formerly filled by ArmyStackMove on line 575
				//$this->game->ArmyStackMove($army_id, $provinces_JSON_stringified);
				//update the database with the final province location
				
				if(!$source_army)
				{
					self::notifyAllPlayers("debug", "", array('debugmessage' => "source_army is null with source_army_id:$source_army_id"));
					continue;
				}
				
				//sanity check: does this army want to move to a different province?
				if($dest_province_name != $source_army['province_id'])
				{
					//update the database with the army's new province
					$sql_update = "UPDATE armies SET province_id='$dest_province_name' WHERE army_id='$source_army_id';";
					self::DbQuery($sql_update);
					
					//record this move to help determine battle order later
					//unique value for move_id is automatically generated by the database
					//todo: i think this is unused?
					$current_turn = $this->getGameStateValue("playerturn_nbr");
					//$sql_insert = "INSERT INTO province_move_order (turn_id, province_name, player_id) VALUES ('$current_turn','$dest_province_name','$current_player_id');";
					//self::DbQuery($sql_insert);
				}
				else
				{
					self::notifyAllPlayers("debug", "", array('debugmessage' => "WARNING: army move ended at same province it started"));
				}
				
				//todo: handle any army splits here using the same steps as movement
				
				self::notifyAllPlayers('playerArmyMove', '', array(
					'moving_player_id' => $current_player_id,
					'moving_player_name' => $current_player_name,
					'army_id_num' => $source_army_id,
					'pending_battles_update' => $this->GetPendingBattleProvincesAll(),
					'dest_province_id' => $dest_province_name
				));
			}
			
			// process the tile payment
			$pips_spent = $this->DiscardTilesFromHand($paid_tile_infos, $current_player_id);
			$this->incStat($pips_spent, "pips_built", $current_player_id);
			
			//did this action trigger any new possible battles?
			//$attacking_player_id = $this->getGameStateValue("attacking_player_id");
			
			$outcome_info["failure_reason"] = self::ACTION_SUCCESS;
		}
		/*else
		{
			//todo: should there be a bgauserexception thrown here? 
			self::notifyPlayer($current_player_id, 'tileRefund', '', array(
				"refunded_tiles" => $paid_tile_infos,
				"location_from" => "paystack"
			));
			self::notifyAllPlayers('playerMoveFail', '', array(
				'moving_player_id' => $current_player_id,
				'moving_player_name' => $current_player_name,
				'army_id_num' => $source_army_id,
				'dest_province_id' => $dest_province_name
			));
		}*/
		
		return $outcome_info;
	}
}