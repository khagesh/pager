pager
=====

JavaScript pager.

Sample 1
=====

[Pager with all functionalities](Images/Wiki/Full-Pager.jpg)

<pre>
  var Pager = new Module.Pager.GetPager({
            TotalResults: 220,
            ContainerSelector: '.Pager1',
            PagerFormat: "{First[class='FirstLinkPager'&text=First]} {Previous[class='PrevLinkPager'&text=Prev]} {PrevPages[class='PrevPages'&text=...]}"
                           +"  {PageNumbers[class='PG-PageNumbers']} {NextPages[class='NextPages'&text=...]} {Next[class='NextLinkPager'&text=Next]}"
                            +" {Last[class='LastLinkPager'&text=Last]} {ShowText[text=Page size:]}"
                            +" {PagerDropDown[values='10:10,20:20,50:50'&class='PagerDropDown']}"
                            +" {ShowText[text=Page]} {PageNavigator[class='PageNavigator']} {ShowText[text=of]} {TotalPages[class='TotalPages']}"
                            +" {ShowText[class='pagesText'&text=pages]} {ShowText[text=for]} {TotalResults[class='totalText']} {ShowText[text=items]}"
        });
        // hook to the change event
        Pager.OnChangeRequest = function (event) {
            console.log("Current Page for Pager1 is " + this.GetCurrentPage() + " Page Size is " + this.GetPageSize());
        };
        // render the pager
        Pager.Render();
</pre>
