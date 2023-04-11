const reverse_pitch_screen_controller = {
    reverse(){
        if(!communication_controller.appServerConnection.connected && !pitch_generator.active.can_edit_when_offline) {
            popup_screen_controller.confirm_popup(translate["Offline"], translate["You cannot modify pitches while offline"], translate["ok"], "", popup_screen_controller.close );
        return;
        }

        if(pitch_generator.get_variable("Reverse")){
            pitch_generator.set_option("Reverse", false); 
        }
        else {
            pitch_generator.set_option("Reverse", true);
        } 
        
        pitch_generator.active.draw();
        edit_pitch_screen_controller.start_save();
        }
}