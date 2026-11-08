package app.yemood;

import android.os.Bundle;
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

/**
 * Android 16 (targetSdk 36) always draws apps edge to edge, so the page would slide under the
 * status bar, the gesture bar and the keyboard. This pads the whole window by those insets and
 * paints the Yemood paper colour behind the bars, so the web page needs no changes.
 */
public class MainActivity extends BridgeActivity {
    private static final int PAPER_COLOR = 0xFFFFF4E0;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        View content = findViewById(android.R.id.content);
        content.setBackgroundColor(PAPER_COLOR);
        ViewCompat.setOnApplyWindowInsetsListener(content, (view, windowInsets) -> {
            Insets bars = windowInsets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            );
            Insets keyboard = windowInsets.getInsets(WindowInsetsCompat.Type.ime());
            view.setPadding(bars.left, bars.top, bars.right, Math.max(bars.bottom, keyboard.bottom));
            return WindowInsetsCompat.CONSUMED;
        });
        // Light paper behind the bars, so the bar icons are drawn dark.
        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), content);
        controller.setAppearanceLightStatusBars(true);
        controller.setAppearanceLightNavigationBars(true);
    }
}
