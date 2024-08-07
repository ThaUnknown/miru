package watch.miru;

import android.os.Bundle;
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
      ServiceWorkerController swController = null;
      swController = ServiceWorkerController.getInstance();

      swController.setServiceWorkerClient(new ServiceWorkerClient() {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebResourceRequest request) {
          if (request.getUrl().toString().contains("index.html")) {
            request.getRequestHeaders().put("Accept", "text/html");
          }
          return bridge.getLocalServer().shouldInterceptRequest(request);
        }
      });
    }
  }
}