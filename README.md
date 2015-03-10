# extapps
Sample External Apps related to 2Pay

## Initial Setup

#### Create Project
```
git checkout --orphan gh-pages
# Remove all files in the directory and add new files
# Add and commit changes
git push -u origin gh-pages
```

#### Clone Project

```
mkdir extapps
git clone git@github.com:2paysys/extapps.git master
git clone git@github.com:2paysys/extapps.git gh-pages
```

## Deployment
```
bin/deploy.sh

cd ../gh-pages
# Add and commit new files
git push
```
