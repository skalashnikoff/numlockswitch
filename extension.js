const { GObject, St, Clutter, Gio } = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Util = imports.misc.util;

const Me = ExtensionUtils.getCurrentExtension();
const Keymap = Clutter.get_default_backend().get_default_seat().get_keymap();


const _ = ExtensionUtils.gettext;


const Indicator = GObject.registerClass(
    class Indicator extends PanelMenu.Button {
        _init() {
            super._init(0.0, 'NumLock Switcher', true);
            this._keyboardStateChangedId = null;

            this.numIcon = new St.Icon({
                style_class: 'system-status-icon',
            })
            this.numIcon.gicon = Gio.icon_new_for_string(`${Me.path}/icons/numlock-symbolic.svg`);
            this.add_child(this.numIcon);

            this.menu.toggle = () => { Util.spawn(['xdotool', 'key', 'Num_Lock']); };

        }

        setActive(enabled) {
            if (enabled) {
                this._keyboardStateChangedId = Keymap.connect('state-changed', this.updateState.bind(this));
                this.updateState()
            } else {
                Keymap.disconnect(this._keyboardStateChangedId);
                this._keyboardStateChangedId = null;
            }
        }

        updateState() {
            if (Keymap.get_num_lock_state())
                this.numIcon.set_style_class_name("system-status-icon enable-style");
            else
                this.numIcon.set_style_class_name("system-status-icon disable-style");
        }
    });

class Extension {
    constructor(uuid) {
        this._uuid = uuid;
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
        this._indicator.setActive(true);
    }

    disable() {
        this._indicator.setActive(false);
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}

